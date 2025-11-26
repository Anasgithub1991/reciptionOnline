
const { pool } = require('/db');
const { v4: uuidv4 } = require('uuid');
const { encrypt } = require('./crypto')
const bcrypt = require("bcryptjs");
const { createCanvas } = require('canvas');

// create captcha text function
const generateCaptchaText = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

// create captcha image function
const createCaptchaImage = (text) => {
  const width = 280; // Increased width for better spacing
  const height = 90;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background (Black)
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);

  // Font settings
  const fontSize = 60;
  ctx.font = `${fontSize}px Courier`;
  ctx.fillStyle = '#FFF';
  ctx.textBaseline = 'middle';

  // Adjust spacing
  const spacing = 40; // Adjust letter spacing
  let x = 20; // Start position from left
  const y = height / 2 + 10; // Centered vertically

  // Draw each letter separately
  for (let i = 0; i < text.length; i++) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((Math.random() - 0.5) * 0.2); // Small rotation
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
    x += spacing; // Move to next position
  }

  // Add Noise (Random Dots)
  for (let i = 0; i < 200; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random()})`;
    ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
  }

  // Add Distortion Lines
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgba(255,255,255,0.5)`;
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  return canvas.toDataURL();  // Return the image as base64 data URL
}

// get data by uuid
const getData = (phoneNo) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM get_captcha where phone_no =$1 order by created_at desc ;`
    pool.query(sql, [phoneNo], (err, result) => {
      if (err) return reject({ success: false, message: 'getCaptcha Data was not read', data: [], error: err })
      resolve({ success: true, message: 'getCaptcha Data was fetched successfuly', data: result.rows, error: '' })
    })
  })
}

export default async function handler(req, res) {
  try {
    const { phone_no } = req.query // get phone number
    let getCaptchaData = await getData(phone_no)// get captcha data

    // check if no data
    if (!getCaptchaData.success) {

      return res.status(400).json({ success: false, message: 'getCaptcha Data validation error', data: [], error: 'no captcha record' });
    }
    
    if (getCaptchaData?.data?.length > 0) {
      let captchaData = getCaptchaData.data[0]// get data
      const dataNow = new Date(Date.now() + 5000)// get time with 5 second pluse
      // expiration checking
      const checkCaptchaExpiration = dataNow <= captchaData?.captcha_expiration 
      // check if date expired
      if (checkCaptchaExpiration == true) {
        return res.status(400).json({ success: false, message: 'getCaptcha data error', data: [], error: 'Too many attmptes' });
      }
    }


    const id = uuidv4();// generate uuid
    const encid = encrypt(id)// encrypt uuid
    const captchaText = generateCaptchaText(); // Function to generate the random CAPTCHA text (6 chars)
    const captchaTextEncrypted = await bcrypt.hash(captchaText, 10) // get hashed code
    const expiresAt = new Date(Date.now() + 30000);// CAPTCHA expires in 30 seconds
    // Generate CAPTCHA image with black background and white text
    const captchaImage = createCaptchaImage(captchaText);
    // insert data to db
    let q = "INSERT INTO public.get_captcha (id, phone_no, captcha_code, captcha_img, created_at, captcha_expiration) VALUES($1, $2, $3,default, now(), $4);"
    pool.query(q, [id, phone_no, captchaTextEncrypted, expiresAt,], (error, result) => {
      if (error) {
        return res.status(400).json({ success: false, message: 'get_captcha generated error', data: [], error: error });
      } else {
        res.status(200).json({
          success: true, message: 'get_captcha generated success', data: {
            encid: encid,
            expiresAt: expiresAt,
            captchaImage: captchaImage
          }, error: ''
        })
      }
    });
  }
  catch (error) {
    console.log('get_captcha generated error', error);
    res.status(400).json({ success: false, message: 'get_captcha generated error', data: [], error: error });
  }
}
