
const { pool, client } = require('/db');

export default function handler(req,res){
    try {
        let q = 'select * from governs '
        pool.query(q, (error, result) => {
          if (error) {
            return res.json({ success: false, message: 'governs read error', data: [], error: error });
          } else {
            res.json({ success: true, message: 'governs read success', data: result.rows, error: '' })
          }
        });
      }
      catch (error) {
        res.json({ success: false, message: 'governs read error', data: [], error: error });
      }
}