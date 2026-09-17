const pool=require('../config/db');
const createUser=async(name,email,password_hash,role)=>(await pool.query('INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,$4) RETURNING id,name,email,role,created_at',[name,email,password_hash,role])).rows[0];
const findUserByEmail=async email=>(await pool.query('SELECT * FROM users WHERE email=$1',[email])).rows[0];
const findUserById=async id=>(await pool.query('SELECT id,name,email,role,created_at FROM users WHERE id=$1',[id])).rows[0];
module.exports={createUser,findUserByEmail,findUserById};
