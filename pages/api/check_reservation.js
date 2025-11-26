const { pool } = require('/db');
import dayjs from 'dayjs'

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

// const reservation_day_phone = (reviewID, phonenum, reservDate) => {
//   return new Promise((resolve, reject) => {
//     const sql = `SELECT * FROM reservation_information where reservation_information."reviewID" =$1 and reservation_information.phonenum =$2 and reservation_information.bookingdate =$3 ;`
//     pool.query(sql, [reviewID, phonenum, reservDate], (err, result) => {
//       if (err) return reject({ success: false, message: 'Reservation_information reservation_day_phone was not read', data: [], error: err })
//       resolve({ success: true, message: 'Reservation_information reservation_day_phone was fetched successfuly', data: result.rows, error: '' })
//     })
//   })
// }

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
const isNotSaturday = (date, fridayTrans, reservation_cat) => {
  let fridayCat = fridayTrans.find((item) => item.id == reservation_cat)
  const day = date.getDay(); // Get the day of the week (0-6)
  let checking = false
  if (day !== 6) {
    checking = true
  }

  if (fridayCat && day == 6) {
    checking = true
  }
  return checking // Return true if not Friday (5) or Saturday (6)
}

const isNotFriday = (date, fridayTrans, reservation_cat) => {
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


export default async function handler(req, res) {

  try {

    const today = dayjs().format('YYYY-MM-DD')

    let { reviewID, phonenum, reservDate, reservationCat, chasis_no
      //carnum  
    } = req.query

    
    if (today >= reservDate) {
      return res.status(200).json({ success: true, message: `SiteFilter read success`, data: { "checkReserv": false }, error: '' });
    }

    let holidays = await holidays_data(reservDate)
    let holidaysvalue = holidays.data.length

    if (holidaysvalue > 0) {
      return res.status(200).json({ success: true, message: `SiteFilter read success`, data: { "checkReserv": false }, error: '' });
    }

    let reservationDayPhone = await reservation_day_phone_chasis(phonenum, chasis_no, reservationCat)
    let reservDayPhone_chasis_data = reservationDayPhone.data[0]
    let reservDayPhone_chasis_length = reservationDayPhone.data.length

    // let reservationDay = await reservation_day(reviewID, phonenum, carnum, reservDate)
    // let reservDay = reservationDay.data.length

    let reviewsit = await reviewsitData(reviewID)

    let reservation = await reservation_information(reviewID, reservDate, reservationCat)
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
    let currentRate = reservationCat == 1 ? carsRate : reservationCat == 2 ? lincenseRate : reservationCat == 3 ? motorsRate : 0

    if (currentRate > 0) {
      checkReserv = reservData < currentRate ? true : false
    }

    // if (reservDay > 0) {
    //   checkReserv = false
    // }


    //check the current phone and chasis is not dublication within more 10 days or less 10 days
    if (reservDayPhone_chasis_length > 0) {
      const previusReservationDate = dayjs(reservDayPhone_chasis_data?.bookingdate)
      const minDay = previusReservationDate.subtract(10, 'day').format('YYYY-MM-DD')//decrease 10 days on current day
      const maxDay = previusReservationDate.add(10, 'day').format('YYYY-MM-DD')//increase 10 days on current day
      if (reservDate <= maxDay && reservDate > previusReservationDate.format('YYYY-MM-DD')) {
        checkReserv = false
      }
      if (reservDate > minDay && reservDate < previusReservationDate.format('YYYY-MM-DD')) {
        checkReserv = false
      }
    }


    // check friday and sturday
    const dateToCheck = new Date(reservDate);
    const checkFri = isNotFriday(dateToCheck, reviewData?.holidayfri, reservationCat)
    const checkSat = isNotSaturday(dateToCheck, reviewData?.holidaysat, reservationCat)

    if (checkFri == false) {
      checkReserv = false
    }

    if (checkSat == false) {
      checkReserv = false
    }

    // console.log("checkReserv",checkReserv);
    // console.log("checkReserv",checkReserv);
    // console.log("checkReserv",checkReserv);
    // console.log("checkReserv",checkReserv);
    // console.log("checkReserv",checkReserv);
    

    return res.status(200).json({ success: true, message: `SiteFilter read success`, data: { checkReserv }, error: '' });

  }
  catch (error) {
    console.log("errror", error);
    res.status(400).json({ success: false, message: 'reservation_information read error', data: { "checkReserv": false }, error: error });
  }
}
