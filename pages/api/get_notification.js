
const { pool, client } = require('/db');

export default function handler(req,res){
    try {
        let q = 'select * from notification '
        pool.query(q, (error, result) => {
          if (error) {
            return res.json({ success: false, message: 'notification read error', data: [], error: error });
          } else {
            res.json({ success: true, message: 'notification read success', data: result.rows, error: '' })
          }
        });
      }
      catch (error) {
        console.log('category error',error);
        res.json({ success: false, message: 'notification read error', data: [], error: error });
      }
}
