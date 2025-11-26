
const { pool, client } = require('/db');

export default function handler(req,res){
    try {
        let q = 'select * from car_category '
        pool.query(q, (error, result) => {
          if (error) {
            return res.json({ success: false, message: 'car_category read error', data: [], error: error });
          } else {
            res.json({ success: true, message: 'car_category read success', data: result.rows, error: '' })
          }
        });
      }
      catch (error) {
        console.log('category error',error);
        
        res.json({ success: false, message: 'car_category read error', data: [], error: error });
      }
}
