const dayjs = require('dayjs')

export default async function handler(req, res) {

  try {
    const currentDay = dayjs()
    const minDay = currentDay.add(1, 'day').format('YYYY-MM-DD')
    const maxDay = currentDay.add(15, 'day').format('YYYY-MM-DD')
    // const maxDay = currentDay.add(1, 'month').format('YYYY-MM-DD')

    return res.status(200).json({ success: true, message: `get dates  read success`, data: { maxDate: maxDay, minDate: minDay }, error: '' });
  }
  catch (error) {
    console.log("errror", error);

    res.status(400).json({ success: false, message: 'reservation_information read error', data: [], error: error });
  }
}
