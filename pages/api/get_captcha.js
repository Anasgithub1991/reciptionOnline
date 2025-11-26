
const { pool } = require('/db');
const { v4: uuidv4 } = require('uuid');
const { encrypt } = require('./crypto')
const bcrypt = require("bcryptjs");
const { createCanvas } = require('canvas');
const { getToken } = require('./auth')
// Shape/color/pattern settings
const SHAPES = ['circle', 'square', 'triangle'];
const PATTERNS = ['solid', 'oblique'] //, 'dots'];
const COLORS = [
  '#d32f2f', // Red
  '#388e3c', // Green
  '#1976d2', // Blue
  '#fbc02d', // Yellow
  '#7b1fa2', // Violet
  '#00bcd4', // Cyan
  '#ffa000', // Orange
  '#5d4037', // Brown
];

// Arabic mappings
const colorNamesAr = {
  '#d32f2f': 'الاحمر',
  '#388e3c': 'الاخضر',
  '#1976d2': 'الازرق',
  '#fbc02d': 'الاصفر',
  '#7b1fa2': 'البنفسجي',
  '#00bcd4': 'التركوازي',
  '#ffa000': 'البرتقالي',
  '#5d4037': 'البني',
};

const patternNamesAr = {
  solid: 'الممتلئة كاملاً',
  oblique: 'المخططة فقط',
  //dots: 'المنقطة فقط'
};

const shapeNamesAr = {
  circle: 'دائرة',
  square: 'مربع',
  triangle: 'مثلث'
};

// Image config
const WIDTH = 350, HEIGHT = 220, SHAPE_COUNT = 8;

// Helpers
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Patterns
function createPattern(ctx, type, color = '#bbb', size = 8) {
  const pCanvas = createCanvas(size, size);
  const pCtx = pCanvas.getContext('2d');
  pCtx.strokeStyle = color;
  pCtx.fillStyle = color;
  if (type === 'dots') {
    pCtx.beginPath();
    pCtx.arc(size / 2, size / 2, size / 4, 0, 2 * Math.PI);
    pCtx.fill();
  } else if (type === 'oblique') {
    // Only one diagonal: from bottom-left to top-right
    pCtx.beginPath();
    pCtx.moveTo(0, size);
    pCtx.lineTo(size, 0);
    pCtx.stroke();

  }
  return ctx.createPattern(pCanvas, 'repeat');
}

// Collision detection (shapes never overlap)
function isOverlap(newBox, boxes) {
  for (let box of boxes) {
    let dx = newBox.x - box.x;
    let dy = newBox.y - box.y;
    let minDist = newBox.size + box.size + 10;
    if (Math.sqrt(dx * dx + dy * dy) < minDist) return true;
  }
  return false;
}

function placeShapes(shapeCount, width, height, minSize = 32, maxSize = 56) {
  let placed = [];
  let maxTries = 200;
  for (let i = 0; i < shapeCount; i++) {
    let shapePlaced = false;
    for (let tryNum = 0; tryNum < maxTries; tryNum++) {
      let size = Math.random() * (maxSize - minSize) + minSize;
      let x = Math.random() * (width - 2 * size) + size;
      let y = Math.random() * (height - 2 * size) + size;
      let newBox = { x, y, size };
      if (!isOverlap(newBox, placed)) {
        placed.push(newBox);
        shapePlaced = true;
        break;
      }
    }
    if (!shapePlaced) {
      // If a shape can't be placed, restart the process for a new arrangement
      return placeShapes(shapeCount, width, height, minSize, maxSize);
    }
  }
  return placed;
}

// Draw any shape at any angle/pattern
function drawShape(ctx, x, y, size, angle, shape, color, pattern, charOrNum) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  switch (shape) {
    case 'circle':
      ctx.arc(0, 0, size, 0, 2 * Math.PI); break;
    case 'square':
      ctx.rect(-size, -size, size * 2, size * 2); break; // side = 2*size
      break;
    case 'triangle':
      ctx.moveTo(0, -size);
      ctx.lineTo(size, size);
      ctx.lineTo(-size, size);
      ctx.closePath();
      break;
  }
  // Always filled with a pattern
  if (pattern === 'solid') {
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.fillStyle = createPattern(ctx, pattern, color);
    ctx.fill();
  }

  // Draw letter/number inside
  if (charOrNum) {
    ctx.fillStyle = '#fff';
    ctx.font = `${Math.round(size * 1.1)}px Arial Black`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.save();
    ctx.rotate(-angle);
    ctx.fillText(charOrNum, 0, 0);
    ctx.restore();
  }

  ctx.restore();
}

const QUESTION_TYPES = [
  // 1. color, pattern, shape
  {
    name: 'color-pattern-shape',
    getKey: s => `${s.shape}-${s.color}-${s.pattern}`,
    question: (shape, color, pattern) =>
      ` عدد الاشكال من النوع ${shapeNamesAr[shape]} ذات اللون ${colorNamesAr[color]} ${patternNamesAr[pattern]}`,
    getFields: combo => ({
      shape: combo.shape,
      color: combo.color,
      pattern: combo.pattern
    }),
    match: (s, combo) => s.shape === combo.shape && s.color === combo.color && s.pattern === combo.pattern,
  },
  // 2. color, shape
  {
    name: 'color-shape',
    getKey: s => `${s.shape}-${s.color}`,
    question: (shape, color) =>
      ` عدد الاشكال من النوع ${shapeNamesAr[shape]} ذات اللون ${colorNamesAr[color]}`,
    getFields: combo => ({
      shape: combo.shape,
      color: combo.color
    }),
    match: (s, combo) => s.shape === combo.shape && s.color === combo.color,
  },
  // 3. color, pattern
  {
    name: 'color-pattern',
    getKey: s => `${s.color}-${s.pattern}`,
    question: (color, pattern) =>
      ` عدد الأشكال ذات اللون ${colorNamesAr[color]} ${patternNamesAr[pattern]}`,
    getFields: combo => ({
      color: combo.color,
      pattern: combo.pattern
    }),
    match: (s, combo) => s.color === combo.color && s.pattern === combo.pattern,
  },
  // 4. pattern, shape
  {
    name: 'pattern-shape',
    getKey: s => `${s.shape}-${s.pattern}`,
    question: (shape, pattern) =>
      ` عدد الاشكال من النوع ${shapeNamesAr[shape]} ${patternNamesAr[pattern]}`,
    getFields: combo => ({
      shape: combo.shape,
      pattern: combo.pattern
    }),
    match: (s, combo) => s.shape === combo.shape && s.pattern === combo.pattern,
  },
  // 5. shape only
  {
    name: 'shape',
    getKey: s => `${s.shape}`,
    question: shape =>
      ` عدد الأشكال من النوع ${shapeNamesAr[shape]}`,
    getFields: combo => ({
      shape: combo.shape
    }),
    match: (s, combo) => s.shape === combo.shape,
  },
  // 6. color only
  {
    name: 'color',
    getKey: s => `${s.color}`,
    question: color =>
      ` عدد الأشكال ذات اللون ${colorNamesAr[color]}`,
    getFields: combo => ({
      color: combo.color
    }),
    match: (s, combo) => s.color === combo.color,
  },
  // 7. pattern only
  {
    name: 'pattern',
    getKey: s => `${s.pattern}`,
    question: pattern =>
      ` عدد الأشكال ${patternNamesAr[pattern]}`,
    getFields: combo => ({
      pattern: combo.pattern
    }),
    match: (s, combo) => s.pattern === combo.pattern,
  }
];

// Function to pick a question & combo not yet used
function pickQuestion(shapesInfo, usedCombos = new Set()) {
  let qType, combos, targetCombo;
  for (let tries = 0; tries < 10; tries++) {
    qType = getRandom(QUESTION_TYPES);
    const freqMap = {};
    for (const s of shapesInfo) {
      const key = qType.getKey(s);
      if (!freqMap[key]) freqMap[key] = [];
      freqMap[key].push(s);
    }
    combos = Object.entries(freqMap)
      .map(([key, arr]) => ({
        combo: arr[0],
        count: arr.length,
        key
      }))
      .filter(({ key }) => !usedCombos.has(key));
    if (combos.length > 0) {
      targetCombo = getRandom(combos);
      usedCombos.add(targetCombo.key);
      break;
    }
  }
  if (!targetCombo) throw new Error('Could not generate distinct question');
  const fields = qType.getFields(targetCombo.combo);
  const questionText = qType.question(...Object.values(fields));
  return {
    questionText,
    answer: targetCombo.count,
    key: targetCombo.key
  };
}

const createCaptchaImage = () => {
  // Place all shapes
  const placed = placeShapes(SHAPE_COUNT, WIDTH, HEIGHT, 32, 56);
  if (placed.length !== SHAPE_COUNT)
    return res.status(500).json({ error: "Could not generate captcha. Please try again." });

  // Build all shapes
  let shapesInfo = [];
  for (let i = 0; i < SHAPE_COUNT; i++) {
    const shape = getRandom(SHAPES);
    const color = getRandom(COLORS);
    const pattern = getRandom(PATTERNS);
    const angle = Math.random() * Math.PI * 2;
    const charOrNum = Math.random() > 0.6
      ? (Math.random() > 0.5
        ? String.fromCharCode(0x41 + Math.floor(Math.random() * 26))
        : String(Math.floor(Math.random() * 10)))
      : null;
    shapesInfo.push({
      ...placed[i], shape, color, pattern, angle, charOrNum
    });
  }

  // Pick two different questions
  const usedCombos = new Set();
  const q1 = pickQuestion(shapesInfo, usedCombos);
  const q2 = pickQuestion(shapesInfo, usedCombos);

  // Aggregate question (Arabic, more natural phrasing)
  const question = `كم مجموع: (${q1.questionText}) + (${q2.questionText})؟`;
  const answer = q1.answer + q2.answer;

  // Draw image
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // (Optional) Add confusion lines
  for (let l = 0; l < 2; l++) {
    ctx.strokeStyle = getRandom(COLORS);
    ctx.lineWidth = 1.5 + Math.random() * 2.5;
    ctx.beginPath();
    ctx.moveTo(Math.random() * WIDTH, Math.random() * HEIGHT);
    ctx.bezierCurveTo(
      Math.random() * WIDTH, Math.random() * HEIGHT,
      Math.random() * WIDTH, Math.random() * HEIGHT,
      Math.random() * WIDTH, Math.random() * HEIGHT
    );
    ctx.stroke();
  }

  // Draw all shapes
  for (const info of shapesInfo) {
    drawShape(ctx, info.x, info.y, info.size, info.angle, info.shape, info.color, info.pattern, info.charOrNum);
  }

  // Add Noise (Random Dots)
  for (let i = 0; i < 200; i++) {
    ctx.fillStyle = getRandom(COLORS);
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 3, 3);
  }

  return {
    question,
    image: canvas.toDataURL(),
    answer
  }
  // Return image, question, answer


}

// get data by phone
const getData = (phoneNo) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM captcha_temp WHERE phone_no = $1 AND created_at > NOW() - INTERVAL '115 seconds' limit 1;`
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
    if (!phone_no) {
      return res.status(400).json({ success: false, message: 'getCaptcha Data validation error', data: [], error: { dataErr: true, megErr: "cannot captcha record" } });
    }

    // check if no data
    if (!getCaptchaData.success) {

      return res.status(400).json({ success: false, message: 'getCaptcha Data validation error', data: [], error: { dataErr: true, megErr: "cannot captcha record" } });
    }

    if (getCaptchaData?.data?.length > 0) {
      return res.status(400).json({ success: false, message: 'getCaptcha data error', data: [], error: { validErr: true, megErr: "Too many attmptes" } });
    }

    const { question, image, answer } = createCaptchaImage()
    // console.log("question",question);
    // console.log("answer",answer);

    const id = uuidv4();// generate uuid
    const encid = encrypt(id)// encrypt uuid
    const encPhoneNo = encrypt(phone_no)
    const token = await getToken({ enc1: encid, enc2: encPhoneNo })
    // const captchaAnswer = answer; // Function to generate the random CAPTCHA text (6 chars)
    const captchaAnswerEncrypted = await bcrypt.hash(answer.toString(), 10) // get hashed code
    // get hashed code
    const expiresAt = new Date(Date.now() + 300000);// CAPTCHA expires in 300 seconds
    // Generate CAPTCHA image with black background and white text
    // const captchaImage = createCaptchaImage(captchaText);
    // insert data to db
    let q = "INSERT INTO public.captcha_temp (id, phone_no, captcha_code, created_at, captcha_expiration) VALUES($1, $2, $3, now(), $4);"
    pool.query(q, [id, phone_no, captchaAnswerEncrypted, expiresAt,], (error, result) => {
      if (error) {
        return res.status(400).json({ success: false, message: 'get_captcha generated error', data: [], error: error });
      } else {
        res.status(200).json({
          success: true, message: 'get_captcha generated success', data: {
            token: token,
            captchaImage: image,
            captchaQuestion: question
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
