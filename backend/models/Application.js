const pool=require('../config/db');
const create=async(i,s)=>(await pool.query('INSERT INTO applications(internship_id,student_id) VALUES($1,$2) RETURNING *',[i,s])).rows[0];
const byStudent=async s=>(await pool.query(`SELECT a.*,i.title,c.company_name FROM applications a JOIN internships i ON i.id=a.internship_id JOIN companies c ON c.id=i.company_id WHERE a.student_id=$1 ORDER BY a.applied_at DESC`,[s])).rows;
const byInternship=async i=>(await pool.query(`SELECT a.*,u.name,u.email,s.college_name,s.course,s.branch,s.year,s.skills,s.phone FROM applications a JOIN students s ON s.id=a.student_id JOIN users u ON u.id=s.user_id WHERE a.internship_id=$1 ORDER BY a.applied_at DESC`,[i])).rows;
const one=async id=>(await pool.query(`SELECT a.*,i.title,i.company_id,s.user_id AS student_user_id FROM applications a JOIN internships i ON i.id=a.internship_id JOIN students s ON s.id=a.student_id WHERE a.id=$1`,[id])).rows[0];
const status=async(id,s)=>(await pool.query('UPDATE applications SET status=$1,updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *',[s,id])).rows[0];
module.exports={create,byStudent,byInternship,one,status};
