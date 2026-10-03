const pool = require('../../backend/config/db');

const createUser = async (name, email, passwordHash, role) => (await pool.query(
  'INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,$4) RETURNING id,name,email,role,created_at',
  [name, email, passwordHash, role],
)).rows[0];
const findUserByEmail = async (email) => (await pool.query('SELECT * FROM users WHERE email=$1', [email])).rows[0];
const findUserById = async (id) => (await pool.query('SELECT id,name,email,role,created_at FROM users WHERE id=$1', [id])).rows[0];
const deleteUser = async (id) => pool.query('DELETE FROM users WHERE id=$1', [id]);
const updateProfile = async (id, name, email) => (await pool.query(
  'UPDATE users SET name=COALESCE($1,name),email=COALESCE($2,email),updated_at=CURRENT_TIMESTAMP WHERE id=$3 RETURNING id,name,email,role,created_at',
  [name || null, email || null, id],
)).rows[0];

module.exports = { createUser, findUserByEmail, findUserById, deleteUser, updateProfile };