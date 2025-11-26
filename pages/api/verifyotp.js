/* POST verify OTP */
const { pool } = require('/db');
import { decrypt } from './crypto'
import { verifyCaptcha } from './verify_new_captcha'

import dayjs from 'dayjs'

export default async function handler(req, res) {
  // console.log("req.body",req.body);
  let decrypted_nanoid = decrypt(req.body.nanoid)
  let { otp = '', phone = '', token, captchaCode } = req.body
  try {

    // checking captcha validation
    let checkCaptcha = await verifyCaptcha(token, captchaCode)

    if (checkCaptcha.success == false) {
      return res.json(checkCaptcha)
    }
    // check otp, nanoid and phone
    if (otp === '' | decrypted_nanoid === '' | phone === '') return res.json({ success: false, message: 'verify otp fail', data: [], error: 'insuffienct data' })
    // read otp data from request_temp by req_id
    let q = 'select id,bookingdate, nanoid , otp, otp_wait, otp_verified from reservation_information_temp where nanoid = $1 and otp_verified is null '
    pool.query(q, [decrypted_nanoid], (error, result) => {
      // check if error
      if (error) return res.json({ success: false, message: 'verify otp fail', data: [], error: 'db conn error' })
      // check if otp is exist in request record
      if (result?.rows?.length <= 0) return res.json({ success: false, message: 'verify otp fail ', data: [], error: 'record not found' })
      // get otp info
      let req_id = result?.rows[0]?.id
      let bookingdate = dayjs(result?.rows[0]?.bookingdate).format('YYYY-MM-DD')
      let db_otp = result?.rows[0]?.otp
      let db_opt_wait = result?.rows[0]?.otp_wait

      // console.log("result?.rows",result?.rows);

      // check otp verification
      if (otp !== db_otp) return res.json({ success: false, message: 'verify otp fail ', data: [], error: { otpError: true, errMsg: 'mismatch' } })
      // check otp date expiration
      if ((new Date(db_opt_wait) - new Date(Date.now())) < 0) return res.json({ success: false, message: 'verify otp fail ', data: [], error: 'timeout' })
      // update otp verification in request id
      pool.query('update reservation_information_temp set otp_verified = $1 where nanoid = $2 ', [new Date(), decrypted_nanoid], (error, result) => {
        // check if error
        if (error) return res.json({ success: false, message: 'verify otp fail', data: [], error: { otpError: true, errMsg: 'db update error' } })
        // insert data from requests_tmp to requests
        pool.query(
          `insert into reservation_information (SELECT id, fname, sname, lname, phonenum, carnum, "goverID", "transID",
           "reviewID",bookingdate, status, created_at, characternum, "exceptionID", reservation_type, car_category_id,
           carnumtype, contractno, contractexpire, nickname, nanoid, false,reservation_cat,chasis_no,fmother,smother,id_card,bookinghours FROM reservation_information_temp WHERE nanoid = $1);`, [decrypted_nanoid], async (error, result) => {
          if (error) {
            // console.log(error)
            res.json({ success: false, message: 'verify otp fail', data: [], error: { otpError: true, errMsg: 'reservation_information copy error' } })
            return
          }
          const response = {
            success: true
          }
          // let response = await sendsms(decrypted_nanoid, phone, bookingdate)
          if (!response?.success) return res.json({ success: false, message: 'otp verify fail', data: [], error: 'sms error' });
          if (response?.success) {
            // remove request temp and details temp and attch temp
            await pool.query(`delete FROM reservation_information_temp where id = $1;`, [req_id], async (error, result) => {
              if (error) return res.json({ success: false, message: 'verify otp fail ', data: [], error: 'requests_temp delete error' })
            })

            return res.json({ success: true, message: 'otp sms verify success', data: [], error: '' })
          }
        })
      })
    })
  }
  catch (error) {
    return res.json({ success: false, message: 'otp verify error catch', data: [], error: error });
  }
}

const sendsms = async (nanoid, phone) => {
  let msg = `وزارة الداخلية
  مديرية المرور
  الحجز المروري
  رقم الحجز : ${nanoid}
  تاريخ الحجز : ${bookingdate}
  `

  let payload = {
    'msg': msg,
    'phone': `00964${phone.substring(1)}`
  }
  const url =
    `${process.env.SMSGATEWAY_API}:${process.env.SMSGATEWAY_PORT}/api/send`;

  const method = 'POST'
  const headers = {
    auth: `auth ${process.env.SMSGATEWAY_TOKEN}`,
    'content-type': 'application/json'
  }
  const body = JSON.stringify(payload)


  let response = await fetch(url, { method, headers, body })
  let jsonRes = await response.json()

  return jsonRes
}

