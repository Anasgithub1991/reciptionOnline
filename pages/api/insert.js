const { pool } = require('/db');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Only POST allowed' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      // reception_record fields
      dataBody = {},

      // Arrays for related data:
      vehicle_reservations = [],
      escorts = [],
      inputValue = {}
    } = req.body;

    console.log('req.body', req.body);

    // Insert into reception_record
    const insertReceptionQuery = `
            INSERT INTO public.reception_record (
                name1, name2, name3, name4, surname,
                mname1, mname2, mname3, mname4, msurname,
                identitynum, phone, district, street, region,
                purpose, job_cat, province_id, notes,
                house, destination_org_id
            ) VALUES (
                $1,$2,$3,$4,$5,
                $6,$7,$8,$9,$10,
                $11,$12,$13,$14,$15,
                $16,$17,$18,$19,
                $20,$21
            )
            RETURNING reception_record_id
        `;
    const {
      name1, name2, name3, name4, surname,
      mname1, mname2, mname3, mname4, msurname,
      identitynum, phone, district, street, region,
      purpose, job_cat, province_id, notes,
      house

    } = dataBody
    let destination_org_id = inputValue.f_unit_id
    const receptionValues = [name1, name2, name3, name4, surname,
      mname1, mname2, mname3, mname4, msurname,
      identitynum, phone, district, street, region,
      purpose, job_cat, province_id, notes,
      house, destination_org_id]

    const cleanedReceptionValues = receptionValues.map(value =>value === '' ? null : value);
    console.log('cleanedReceptionValues', insertReceptionQuery, cleanedReceptionValues);

    const receptionResult = await client.query(insertReceptionQuery, cleanedReceptionValues);
    const reception_record_id = receptionResult.rows[0].reception_record_id;

    // Insert into vehicle_reservation
 
    const insertVehicleQuery = `
            INSERT INTO public.vehicle_reservation (
                reception_record_id,  
                carnumtype, carnum, characternum,
                gover_id
            ) VALUES ($1, $2, $3, $4, $5)
        `;

    for (const v of vehicle_reservations) {
      const vehicleValues = [
        reception_record_id,
         v.carnumtype.value,
        v.carnum,
        v.characternum,
        1
      ];
      console.log('anas',insertVehicleQuery, vehicleValues);
      
      await client.query(insertVehicleQuery, vehicleValues);
    }

    // ✅ Insert into escort_info (corrected)
    const insertEscortQuery = `
            INSERT INTO public.escort_info (
                reception_record_id,
                exname1, exname2, exname3, exname4,
                exsname,
                exmname1, exmname2, exmname3,
                exbrithdate,
                exid_card, exphonenum, exvistor_org
            ) VALUES (
                $1,$2,$3,$4,$5,
                $6,
                $7,$8,$9,
                $10,
                $11,$12,$13
            )
        `;

    for (const e of escorts) {
      const escortValues = [
        reception_record_id,
        e.exname1, e.exname2, e.exname3, e.exname4,
        e.exsname,
        e.exmname1, e.exmname2, e.exmname3,
        e.exbrithdate,
        e.exid_card, e.exphonenum, e.exvistor_org
      ];
      await client.query(insertEscortQuery, escortValues);
    }

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'All records inserted successfully',
      reception_record_id
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    res.status(500).json({ success: false, message: 'Insert failed', error: error.message });
  } finally {
    client.release();
  }
}
