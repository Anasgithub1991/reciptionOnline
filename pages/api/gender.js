
const { pool, client } = require('/db');

export default function handler(req, res) {
    try {
        let q = 'select * from gender'
        pool.query(q, (error, result) => {
          if (error) {
            return res.json({ success: false, message: 'gender read error', data: [], error: error });
          } else {
            res.json({ success: true, message: 'gender read success', data: result.rows, error: '' })
          }
        });
      }
      catch (error) {
        res.json({ success: false, message: 'gender read success', data: [], error: error });
      }
  }

