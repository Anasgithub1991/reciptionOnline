/* POST new request publicly. */
const { pool } = require('/db');
import { customAlphabet } from 'nanoid';
import { encrypt } from './crypto'
import { verifyCaptcha } from './verify_new_captcha'
import dayjs from 'dayjs'


// cheking reservation functions
const reservation_information = (reviewID, reservDate, reservationCat) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM reservation_information where reservation_information."reviewID" =$1 and reservation_information.bookingdate=$2 and reservation_cat=$3;`
        pool.query(sql, [reviewID, reservDate, reservationCat], (err, result) => {
            if (err) return reject({ success: false, message: 'Reservation_information was not read', data: [], error: err })
            resolve({ success: true, message: 'Reservation_information was fetched successfuly', data: result.rows, error: '' })
        })
    })
}

const reservation_day_phone_chasis = (phonenum, chasis_no, reservationCat) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM reservation_information where reservation_information.phonenum = $1 and reservation_information.chasis_no = $2 and reservation_cat=$3 order by reservation_information.bookingdate desc;`
        let arr1 = [phonenum, chasis_no, reservationCat]

        const sql2 = `SELECT * FROM reservation_information where reservation_information.phonenum = $1 and reservation_cat=$2 order by reservation_information.bookingdate desc;`
        let arr2 = [phonenum, reservationCat]
        let sqlFinal = reservationCat == 2 ? sql2 : sql
        let arrFinal = reservationCat == 2 ? arr2 : arr1
        pool.query(sqlFinal, arrFinal, (err, result) => {
            if (err) return reject({ success: false, message: 'Reservation_information reservation_day was not read', data: [], error: err })
            resolve({ success: true, message: 'Reservation_information reservation_day was fetched successfuly', data: result.rows, error: '' })
        })
    })
}

const holidays_data = (reservDate) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM publicholidays where day =$1;`
        pool.query(sql, [reservDate], (err, result) => {
            if (err) return reject({ success: false, message: 'Reservation_information holidays_data was not read', data: [], error: err })
            resolve({ success: true, message: 'Reservation_information holidays_data was fetched successfuly', data: result.rows, error: '' })
        })
    })
}

const reviewsitData = (reviewID) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM reviewsit where reviewsit.id =$1;`
        pool.query(sql, [reviewID], (err, result) => {
            if (err) return reject({ success: false, message: 'Reservation_information reviewsitData was not read', data: [], error: err })
            resolve({ success: true, message: 'Reservation_information reviewsitData was fetched successfuly', data: result.rows, error: '' })
        })
    })
}

// check the reservation date is not friday or saturday 
const isNotSaturday = (date, saturdayTrans, reservation_cat) => {
    // console.log("fridayTrans", saturdayTrans);

    let saturdayCat = saturdayTrans.find((item) => item.id == reservation_cat)
    const day = date.getDay(); // Get the day of the week (0-6)
    let checking = false
    if (day !== 6) {
        checking = true
    }

    if (saturdayCat && day == 6) {
        checking = true
    }
    return checking // Return true if not Friday (5) or Saturday (6)
}

const isNotFriday = (date, fridayTrans, reservation_cat) => {
    // console.log("fridayTrans", fridayTrans);
    let fridayCat = fridayTrans.find((item) => item.id == reservation_cat)
    const day = date.getDay(); // Get the day of the week (0-6)
    let checking = false
    if (day !== 5) {
        checking = true
    }

    if (fridayCat && day == 5) {
        checking = true
    }

    return checking //&& day !== 6; // Return true if not Friday (5) or Saturday (6)
}

// reservation information
const generateOTP = () => {
    // Generate a random 6-digit number
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
}

// Define the hexadecimal alphabet
const alphabet = '0123456789ABCDEF';

// Create a nanoid generator using the customAlphabet function
const generateHexNanoid = customAlphabet(alphabet, 10);

export default async function handler(req, res) {
    try {
        console.log('req.body',req.body);
        
        // define values from req body
        let {
            captchaToken, captchaCode, fname, sname, lname, nickname, phonenum, carnum, goverID, transID, reviewID, bookingdate,
            characternum, car_category_id, carnumtype, contractno, contractexpire, reservation_cat, chasis_no, fmother, smother, id_card,bookinghours
        } = req.body

        // checking captcha validation
        let checkCaptcha = await verifyCaptcha(captchaToken, captchaCode)

        if (checkCaptcha.success == false) {
            return res.json(checkCaptcha)
        }

        const currentDay = dayjs()
        const today = dayjs().format('YYYY-MM-DD')
        const maxDay = currentDay.add(10, 'day').format('YYYY-MM-DD') //currentDay.add(1, 'month').format('YYYY-MM-DD')

        if (today >= bookingdate) {
            return res.status(400).json({ success: false, message: `Error in reservation date`, data: { "checkReserv": false }, error: '' });
        }

        let holidays = await holidays_data(bookingdate)
        let holidaysvalue = holidays.data.length

        if (holidaysvalue > 0) {
            return res.status(200).json({ success: true, message: `SiteFilter read success`, data: { "checkReserv": false }, error: '' });
        }

        let reservationDayPhone = await reservation_day_phone_chasis(phonenum, chasis_no, reservation_cat)
        let reservDayPhone_chasis_data = reservationDayPhone.data[0]
        let reservDayPhone_chasis_length = reservationDayPhone.data.length


        // let reservationDay = await reservation_day(reviewID, phonenum, carnum, bookingdate)
        // let reservDay = reservationDay.data.length

        let reviewsit = await reviewsitData(reviewID)

        let reservation = await reservation_information(reviewID, bookingdate, reservation_cat)
        let reservData = reservation.data.length

        let reviewData = reviewsit.data[0]
        // console.log("reviewData", reviewData);

        // checking var
        let checkReserv = false
        // cars rate
        let carsRate = reviewData.reviewrate
        // lincense rate
        let lincenseRate = reviewData.reviewratelicence
        // motors rate
        let motorsRate = reviewData.reviewratemotor

        // current rate
        let currentRate = reservation_cat == 1 ? carsRate : reservation_cat == 2 ? lincenseRate : reservation_cat == 3 ? motorsRate : 0
        if (currentRate > 0) {
            checkReserv = reservData < currentRate ? true : false
        }

        // if (reservDay > 0) {
        //   checkReserv = false
        // }

        //check the current phone and chasis is not dublication within 10 days
        if (reservDayPhone_chasis_length > 0) {
            const previusReservationDate = dayjs(reservDayPhone_chasis_data?.bookingdate)
            const minDay = previusReservationDate.subtract(10, 'day').format('YYYY-MM-DD')//decrease 10 days on current day
            const maxDay = previusReservationDate.add(10, 'day').format('YYYY-MM-DD')//increase 10 days on current day
            if (bookingdate <= maxDay && bookingdate > previusReservationDate.format('YYYY-MM-DD')) {
                checkReserv = false
            }
            if (bookingdate > minDay && bookingdate < previusReservationDate.format('YYYY-MM-DD')) {
                checkReserv = false
            }
        }


        // check friday and sturday
        const dateToCheck = new Date(bookingdate);
        const checkFri = isNotFriday(dateToCheck, reviewData?.holidayfri, reservation_cat)
        const checkSat = isNotSaturday(dateToCheck, reviewData?.holidaysat, reservation_cat)

        if (checkFri == false) {
            checkReserv = false
        }

        if (checkSat == false) {
            checkReserv = false
        }

        if (checkReserv == false) {
            return res.status(400).json({ success: false, message: `Error in reservation date`, data: { checkReserv }, error: '' });
        }

        // generate otp
        let otpdata = {
            otp: generateOTP(),
            otp_wait: new Date(Date.now() + 5 * 60 * 1000),
            otp_verified: null,
        }
        // generate nanoid
        let generated_nanoid = generateHexNanoid()
        // insert function

        // const { token, captcha } = req.body
        // const tokenPayload = await verifyJWEToken(token)
        // if (tokenPayload.verify == false || tokenPayload.msg != captcha) {
        //     return res.json({ success: false, message: 'captcha error', data: [], error: 'cannot match captcha' })
        // }
console.log('📦 Incoming POST body:', req.body);

        if (contractexpire == '' || contractexpire == null) {
            contractexpire = '1900-01-01'
        }
        let q = `INSERT INTO public.reservation_information_temp(
                id, fname, sname, lname, phonenum, carnum, "goverID", "transID", "reviewID",
                bookingdate, status, created_at, characternum, "exceptionID", reservation_type, 
                car_category_id, carnumtype, contractno, contractexpire, nickname, otp, otp_wait,
                otp_verified, nanoid,reservation_cat,chasis_no,fmother,smother,id_card,bookinghours)
                VALUES (default, $1,$2, $3,$4, $5,$6, $7,$8, $9, 2, default,$10,default,1 , $11,$12, $13, $14,$15, $16, $17, $18, $19,$20,$21,$22,$23,$24,$25)`
        // check if carnum is null
        carnum = carnum == '' ? null : carnum
        chasis_no = chasis_no == '' ? null : chasis_no
        pool.query(q, [fname, sname, lname, phonenum, carnum, goverID, transID, reviewID, bookingdate, characternum,
            car_category_id, carnumtype, contractno, contractexpire, nickname, otpdata.otp, otpdata.otp_wait,
            otpdata.otp_verified, generated_nanoid, reservation_cat, chasis_no, fmother, smother, id_card,bookinghours
            // , otpdata.otp, otpdata.otp_wait, otpdata.otp_verified
          
        ], async (error, result) => {
            if (error) {
                console.log('error', error);

                return res.json({
                    success: false, message: 'reservation_information_temp insert error', data: [], error: "reservation_information_temp insert error"
                })
            }
            const response = {
                success: true
            }
            // console.log("otp",otpdata.otp);
            // const response = await sendsms(otpdata.otp, phonenum)
            // console.log("response", response)

            if (!response?.success) return res.json({ success: false, message: 'reservation_information_temp insert error sms', data: [], error: 'reservation_information_temp insert error sms' })
            if (response?.success) return res.json(
                {
                    success: true, message: 'reservation_information_temp insert success',
                    data: {
                        v1: encrypt(generated_nanoid), // v1 = nanoid
                        // v2: encrypt(req_id) // v2 = reqid
                    }
                    , error: ''
                }
            )
        })

    }

    catch (error) {
        console.log("api error", error)
        return res.json({ success: false, message: 'reservation_information_temp error', data: [], error: error })

    }
}

const sendsms = async (otp, phone) => {
    // console.log('sms1');

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
    // console.log('headers',headers);
    let response = await fetch(url, { method, headers, body })
    let jsonRes = await response.json()
    return jsonRes
}
