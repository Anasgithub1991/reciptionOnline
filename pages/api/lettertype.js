
const { pool, client } = require('/db');

export default function handler(req,res){
    try {
        let q = 'select * from lettertype '
        pool.query(q, (error, result) => {
          if (error) {
            return res.json({ success: false, message: 'lettertype read error', data: [], error: error });
          } else {
            res.json({ success: true, message: 'lettertype read success', data: result.rows, error: '' })
          }
        });
      }
      catch (error) {
        res.json({ success: false, message: 'lettertype read error', data: [], error: error });
      }
}