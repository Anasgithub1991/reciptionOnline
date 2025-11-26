
const { pool } = require('/db');
const { decrypt } = require('./crypto')
const { verifyToken } = require('./auth')
const bcrypt = require("bcryptjs");

// get data by uuid
const getData = (uuid) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM captcha_temp where id =$1 AND created_at > NOW() - INTERVAL '300 seconds' limit 1;`
    pool.query(sql, [uuid], (err, result) => {
      if (err) return reject({ success: false, message: 'getCaptcha Data was not read', data: [], error: err })
      resolve({ success: true, message: 'getCaptcha Data was fetched successfuly', data: result.rows, error: '' })
    })
  })
}

// delete data by uuid
const deleteData = (uuid) => {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM captcha_temp where id =$1;`
    pool.query(sql, [uuid], (err, result) => {
      if (err) return reject({ success: false, message: 'getCaptcha Data was not deleted', data: [], error: err })
      resolve({ success: true, message: 'getCaptcha Data was deleted successfuly', data: result, error: '' })
    })
  })
}

const verifyCaptcha = async (token, captchaCode) => {
  try {
    const checkToken = await verifyToken(token)
    if (checkToken.verify == false) {
      return { success: false, message: 'verifyCaptcha validation error', data: [], error: { errToken: true, errMsg: 'invalid token' } };
    }
    const encid = checkToken.msg?.enc1
    const encPhoneNo = checkToken.msg?.enc2
    // const { encid, phoneNo, captchaCode } = req.body // get request data body
    const uuid = decrypt(encid) // decrypt uuid
    const phoneNo = decrypt(encPhoneNo) // decrypt uuid
    let getCaptchaData = await getData(uuid)// get captcha data
    
    // check if no data
    if (!getCaptchaData.success || getCaptchaData?.data?.length <= 0) {
      return { success: false, message: 'getCaptcha Data validation error', data: [], error: { errCaptcha: true, errMsg: 'no valid captcha record' } };
    }
    let captchaData = getCaptchaData.data[0]// get data

    const checkCaptchaCode = bcrypt.compareSync(captchaCode.toString(), captchaData?.captcha_code)
    // check if code not mathced
    if (!checkCaptchaCode) {
      return { success: false, message: 'verifyCaptcha validation error', data: [], error: { errCaptcha: true, errMsg: 'code not matched!' } };
    }
    // check if phone number not matched
    if (phoneNo !== captchaData?.phone_no) {
      return { success: false, message: 'verifyCaptcha validation error', data: [], error: { errCaptcha: true, errMsg: 'phone not matched!' } };
    }
    // delete captcha after validation
    let deleteCaptcha = await deleteData(uuid)
    // check if delete completed
    if (!deleteCaptcha.success) {
      return { success: false, message: 'verifyCaptcha Data validation error', data: [], error: { errCaptcha: true, errMsg: error } };
    }
    // console.log("deleteCaptcha",deleteCaptcha);
    
    // return result
    return { success: true, message: 'verifyCaptcha validation successfull', data: { captchaCode: captchaCode, phoneNo: phoneNo }, error: '' };
  }
  catch (error) {
    console.log('verifyCaptcha Data error', error);
    return { success: false, message: 'verifyCaptcha validation error', data: [], error: { errCaptcha: true, errMsg: error } };
  }
}

module.exports = { verifyCaptcha }
