
const { pool } = require('/db');
const { decrypt } = require('./crypto')
const bcrypt = require("bcryptjs");

// get data by uuid
const getData = (uuid) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM get_captcha where id =$1;`
    pool.query(sql, [uuid], (err, result) => {
      if (err) return reject({ success: false, message: 'getCaptcha Data was not read', data: [], error: err })
      resolve({ success: true, message: 'getCaptcha Data was fetched successfuly', data: result.rows, error: '' })
    })
  })
}

// delete data by uuid
const deleteData = (uuid) => {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM get_captcha where id =$1;`
    pool.query(sql, [uuid], (err, result) => {
      if (err) return reject({ success: false, message: 'getCaptcha Data was not deleted', data: [], error: err })
      resolve({ success: true, message: 'getCaptcha Data was deleted successfuly', data: [], error: '' })
    })
  })
}

export default async function handler(req, res) {

  try {
    const { encid, phoneNo, captchaCode } = req.body // get request data body
    const decrypted_uuid = decrypt(encid) // decrypt uuid
    let getCaptchaData = await getData(decrypted_uuid)// get captcha data

     // check if no data
     if (!getCaptchaData.success || getCaptchaData?.data?.length <= 0) {
      return res.status(400).json({ success: false, message: 'getCaptcha Data validation error', data: [], error: 'no captcha record' });
    }
    let captchaData = getCaptchaData.data[0]// get data
    const dataNow = new Date(Date.now() - 5000)// get time with 5 second pluse
    // expiration checking
    const checkCaptchaExpiration = dataNow > captchaData?.captcha_expiration 
    // check if date expired
    if (checkCaptchaExpiration == true) {
      return res.status(400).json({ success: false, message: 'verifyCaptcha validation error', data: [], error: 'date expired' });
    }
    // code comparing
    const checkCaptchaCode = bcrypt.compareSync(captchaCode, captchaData?.captcha_code)
    // check if code not mathced
    if (!checkCaptchaCode) {
      return res.status(400).json({ success: false, message: 'verifyCaptcha validation error', data: [], error: 'code not matched!' });
    }
    // check if phone number not matched
    if (phoneNo !== captchaData?.phone_no) {
      return res.status(400).json({ success: false, message: 'verifyCaptcha validation error', data: [], error: 'phone not matched!' });
    }
    // delete captcha after validation
    let deleteCaptcha = await deleteData(decrypted_uuid)
    // check if delete completed
    if (!deleteCaptcha.success) {
      return res.status(400).json({ success: false, message: 'verifyCaptcha Data validation error', data: [], error: error });
    }
    // return result
    return res.status(200).json({ success: true, message: 'verifyCaptcha validation successfull', data: { captchaCode: captchaCode, phoneNo: phoneNo }, error: '' });
  }
  catch (error) {
    console.log('verifyCaptcha Data error', error);
    res.status(400).json({ success: false, message: 'verifyCaptcha validation error', data: [], error: error });
  }
}
