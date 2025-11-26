const { pool } = require('/db'); // تأكد من أن المسار صحيح

export default function handler(req, res) {
  try {
    const reviewId = parseInt(req.query.reviewid); // نحصل على reviewid من query

    if (isNaN(reviewId)) {
      return res.status(400).json({ success: false, message: 'reviewid is required and must be a number', data: [], error: '' });
    }

    const q = 'SELECT * FROM public.reviewsit WHERE id = $1 ORDER BY id ASC';

    pool.query(q, [reviewId], (error, result) => {
      if (error) {
        return res.json({ success: false, message: 'reviewsit read error', data: [], error: error });
      } else {
        res.json({ success: true, message: 'reviewsit read success', data: result.rows, error: '' });
      }
    });
  } catch (error) {
    res.json({ success: false, message: 'reviewsit read error', data: [], error: error });
  }
}
