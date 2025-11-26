
const { pool } = require('/db');
const { decrypt } = require('./crypto')
const bcrypt = require("bcryptjs");

// get data by uuid

const getData = (uuid) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM captcha_temp where id =$1;`
    pool.query(sql, [uuid], (err, result) => {
      if (err) return reject({ success: false, message: 'getCaptcha Data was not read', data: [], error: err })
      resolve({ success: true, message: 'getCaptcha Data was fetched successfuly', data: result.rows, error: '' })
    })
  })
}
// updated data by uuid
const updateData = (expirationDate, phoneNo, uuid) => {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE captcha_temp set captcha_expiration=$1,phone_no=$2 where id =$3;`
    pool.query(sql, [expirationDate, phoneNo, uuid], (err, result) => {
      if (err) return reject({ success: false, message: 'getCaptcha Data was not read', data: [], error: err })
      resolve({ success: true, message: 'updatedCaptcha Data was successfuly', data: result.rows, error: '' })
    })
  })
}

export default async function handler(req, res) {

  try {
    const { encid, phoneNo } = req.body // get request data body
    const decrypted_uuid = decrypt(encid) // decrypt uuid
    

    let getCaptchaData = await getData(decrypted_uuid)// get captcha data
    // check if no data
    if (!getCaptchaData.success || getCaptchaData?.data?.length <= 0) {
      return res.status(400).json({ success: false, message: 'getCaptcha in update Data validation error', data: [], error: 'no captcha record' });
    }

    const expiresAt = new Date(Date.now() + 30000);// CAPTCHA expires in 30 seconds
    let updateCaptchaData = await updateData(expiresAt, phoneNo, decrypted_uuid)// get captcha data

    // check if update data
    if (!updateCaptchaData.success) {
      return res.status(400).json({ success: false, message: 'updatedCaptcha updated error', data: [], error: updateCaptchaData.error });
    }
    // return result
    return res.status(200).json({
      success: true, message: 'updatedCaptcha updated successfull', data: {
        phoneNo: phoneNo, expiresAt: expiresAt
      }, error: ''
    });
  }
  catch (error) {
    console.log('updatedCaptcha updated error', error?.error);
    res.status(400).json({ success: false, message: 'verifyCaptcha validation error', data: [], error: error?.error });
  }
}
