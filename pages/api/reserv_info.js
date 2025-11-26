
const { pool, client } = require('/db');
import { decrypt } from './crypto'
export default function handler(req, res) {
  try {
    let decrypted_nanoid = decrypt(req.body.nanoid)
    let q = `select * from reserv_info where nanoid=$1`
    pool.query(q, [decrypted_nanoid], (error, result) => {
      if (error) {
        return res.json({ success: false, message: 'reserv_info read error', data: [], error: error });
      } else {
        res.json({ success: true, message: 'reserv_info read success', data: result.rows, error: '' })
      }
    });
  }
  catch (error) {
    console.log('reserv_info error', error);

    res.json({ success: false, message: 'reserv_info read error', data: [], error: error });
  }
}
