const { pool } = require('/db');
import { verifyCaptcha } from './verify_new_captcha'
// import { verifyJWEToken } from '../../auth/token'

function generateOTP() {
    // Generate a random 6-digit number
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
}

export default async function handler(req, res) {
    try {
        let { nanoid, phone, token, captchaCode } = req.body
        // checking captcha validation
        let checkCaptcha = await verifyCaptcha(token, captchaCode)

        if (checkCaptcha.success == false) {
            return res.json(checkCaptcha)
        }

        // console.log('step1');
        let otpdata = {
            otp: generateOTP(),
            otp_wait: new Date(Date.now() + 5 * 60 * 1000),
            otp_verified: null,
        }
       

        // const captchaResponse = await axios.post(
        //     `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.SECRET_KEY}&response=${token}`
        // );

        // // Check response status and send back to the client-side
        // if (captchaResponse.data.success === false | captchaResponse?.data?.score < 0.7) throw 'requests insert error captcha'

        pool.query('UPDATE requests_temp  SET otp=$1, otp_wait=$2, otp_verified=$3 where nanoid = $4 and otp_verified is null ;', [otpdata.otp, otpdata.otp_wait, otpdata.otp_verified, nanoid], async (error, result) => {
            if (error) return res.json({ success: false, message: 'otp resend error', data: [], error: error })
            let response = await sendsms(otpdata.otp, phone)
            if (!response?.success) return res.json({ success: false, message: 'otp resend error sms', data: [], error: '' })
            if (response?.success) return res.json({ success: true, message: 'otp sms resend success', data: [], error: '' })
        })

    } catch (error) {
        return res.json({ success: false, message: 'otp resend error', data: [], error: error })
    }

}



const sendsms = async (otp, phone) => {
    let msg = `
    وزارة الداخلية
     مديرية المرور
    الحجز المروري
    رمز التحقق : ${otp}
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



