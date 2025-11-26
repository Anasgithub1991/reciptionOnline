
import dayjs from 'dayjs'

export default function handler(req, res) {
  try {
    let today = dayjs().add(1, "day").format('YYYY-MM-DD')
    let nextMonth = dayjs().add(1, "month").add(1,"day").format('YYYY-MM-DD')
    let lastMonth = dayjs().subtract(1, "month").format('YYYY-MM-DD')
    return res.json({ success: true, message: 'max min date read', data: { maxDate: nextMonth, minDate: today, lastMonth: lastMonth }, error: '' });
  }
  catch (error) {
    console.log('category error', error);

    res.json({ success: false, message: 'car_category read error', data: [], error: error });
  }
}
