
const { pool, client } = require('/db');

export default function handler(req, res) {
  try {
    let { carLetterID, carCatID, carNumID, reservationCat, transID } = req.query
    // car
    let sqlCarOldNum = `SELECT * FROM public.reviewsit WHERE 
      "carcatrgeoryarray" @> '[{"id" : ${carCatID}}]'  
      and "carnumtypearray" @> '[{"id" : ${carNumID}}]';`;

    let sqlCarNewNum = `SELECT * FROM public.reviewsit WHERE 
      "letterarray" @> '[{"id" : ${carLetterID}}]'  
      and "carcatrgeoryarray" @> '[{"id" : ${carCatID}}]'   
      and "carnumtypearray" @> '[{"id" : ${carNumID}}]';`;
    let carQuery = carLetterID ? sqlCarNewNum : sqlCarOldNum
    // motor
    let MotorQuery = `SELECT * FROM public.reviewsit WHERE 
    "letterarraymotor" @> '[{"id" : ${carLetterID}}]'  
    and "carcatarraymotor" @> '[{"id" : ${carCatID}}]'   
    and "carnumarraymotor" @> '[{"id" : ${carNumID}}]';`;

    //license
    let licenseQuery = `SELECT * FROM public.reviewsit WHERE 
      "transtiontypearraylicence" @> '[{"id" : ${transID}}]'`
    let query = reservationCat == 1 ? carQuery : reservationCat == 2 ? licenseQuery : reservationCat == 3 ? MotorQuery : ''

    // 
    pool.query(query, (error, result) => {
      if (error) {
        console.log("error", error);

        return res.json({ success: false, message: 'SiteFilter read error', data: [], error: error });
      } else {
        res.json({ success: true, message: `SiteFilter read success`, data: result.rows, error: '' })
      }
    });
  }
  catch (error) {
    console.log("error", error);
    res.json({ success: false, message: 'SiteFilter read error', data: [], error: error });
  }
}
