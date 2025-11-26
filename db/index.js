// const oracledb = require('oracledb');
const dotenv = require('dotenv');
dotenv.config();


const { Pool, Client } = require('pg')

const pool = new Pool({
    user: process.env.PG_PUBLIC_USER,
    host: process.env.PG_PUBLIC_HOST,
    database: process.env.PG_PUBLIC_DATABASE,
    password: process.env.PG_PUBLIC_PASSWORD,
    port: process.env.PG_PUBLIC_PORT,
})

const poolCaptcha = new Pool({
    user: process.env.PG_CAPTCHA_USER,
    host: process.env.PG_CAPTCHA_HOST,
    database: process.env.PG_CAPTCHA_DATABASE,
    password: process.env.PG_CAPTCHA_PASSWORD,
    port: process.env.PG_CAPTCHA_PORT,
})

// pool.query('SELECT NOW()', (err, res) => {
//     console.log(err, res)
//     pool.end()
// })

const client = new Client({
    user: process.env.PG_PUBLIC_USER,
    host: process.env.PG_PUBLIC_HOST,
    database: process.env.PG_PUBLIC_DATABASE,
    password: process.env.PG_PUBLIC_PASSWORD,
    port: process.env.PG_PUBLIC_PORT,
})

// client.connect()




// //create connection
// async function initialize() {

//     await oracledb.createPool({
//         username: process.env.DB_USERNAME,
//         password: process.env.DB_PASSWORD,
//         connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_CONTAINER}`,
//         poolMin: 10,
//         poolMax: 10,
//         poolIncrement: 0
//     })
//     console.warn('INFO: db pool created.')
// }


//export connection
// module.exports.initialize = initialize()

module.exports = { pool, client,poolCaptcha }

