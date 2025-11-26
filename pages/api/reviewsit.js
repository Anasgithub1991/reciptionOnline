
const { pool, client } = require('/db');

export default function handler(req,res){
    try {
        let q = 'select * from reviewsit '
        pool.query(q, (error, result) => {
          if (error) {
            return res.json({ success: false, message: 'reviewsit read error', data: [], error: error });
          } else {
            res.json({ success: true, message: 'reviewsit read success', data: result.rows, error: '' })
          }
        });
      }
      catch (error) {
        res.json({ success: false, message: 'reviewsit read error', data: [], error: error });
      }
}