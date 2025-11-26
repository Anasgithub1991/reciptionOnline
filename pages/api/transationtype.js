
const { pool, client } = require('/db');

export default function handler(req,res){
    try {
        let q = 'select * from transationtype where reservation_cat=2'
        pool.query(q, (error, result) => {
          if (error) {
            return res.json({ success: false, message: 'transationtype read error', data: [], error: error });
          } else {
            res.json({ success: true, message: 'transationtype read success', data: result.rows, error: '' })
          }
        });
      }
      catch (error) {
        res.json({ success: false, message: 'transationtype read error', data: [], error: error });
      }
}
