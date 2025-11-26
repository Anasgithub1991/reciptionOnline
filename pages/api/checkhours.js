const { pool } = require('/db'); // تأكد من أن المسار صحيح

export default async function handler(req, res) {
  try {
    const reviewId = parseInt(req.query.reviewid);
    const bookingDate = req.query.bookingdate;
    const bookingHours = req.query.bookinghours;
    const reservation_cat = req.query.reservationCat;
console.log();

    // التحقق من المتغيرات
    if (
      isNaN(reviewId) ||
      !bookingDate ||
      !bookingHours
    ) {
      return res.status(400).json({
        success: false,
        message: 'reviewid, bookingdate, and bookinghours are required',
        data: [],
        error: '',
      });
    }

    // استعلام السعة وعدد الحجوزات
    const query = `
      SELECT 
        r.capacity, 
        (
          SELECT COUNT(*) 
          FROM public.reservation_information 
          WHERE "reviewID" = $1 AND bookingdate = $2 AND bookinghours = $3 AND reservation_cat =$4
        ) AS current_reservations
      FROM public.reviewsit r
      WHERE r.id = $1
    `;

    const values = [reviewId, bookingDate, bookingHours,reservation_cat];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No review found with this ID',
        data: [],
        error: '',
      });
    }

    const { capacity, current_reservations } = result.rows[0];

    // ✅ رجع البيانات مباشرة بدون شرط
    return res.status(200).json({
      success: true,
      message: 'Data fetched successfully',
      data: { capacity, current_reservations },
      error: '',
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      data: [],
      error: error.message,
    });
  }
}
