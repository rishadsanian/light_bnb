const { Pool } = require("pg"); //setup postgress as database

//setup pool to interact with db
const pool = new Pool({
  user: "labber",
  password: "labber",
  host: "localhost",
  database: "lightbnb",
});

module.exports.query = (text, params, callback) => {
  return pool.query(text, params, callback);
};


// notice here I'm requiring my database adapter file
// // and not requiring node-postgres directly
// import * as db from '../db.js'
 
// app.get('/:id', async (req, res, next) => {
//   const result = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id])
//   res.send(result.rows[0])
// })
 
// // ... many other routes in this file

// import { Pool } from 'pg'
 
// const pool = new Pool()
 
// export const query = async (text, params) => {
//   const start = Date.now()
//   const res = await pool.query(text, params)
//   const duration = Date.now() - start
//   console.log('executed query', { text, duration, rows: res.rowCount })
//   return res
// }