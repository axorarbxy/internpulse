const pool=require('../config/db');
const getByUserId=async id=>(await pool.query('SELECT s.*,u.name,u.email FROM students s JOIN users u ON u.id=s.user_id WHERE s.user_id=$1',[id])).rows[0];
const upsert=async(id,d)=>(await pool.query(`INSERT INTO students(user_id,college_name,course,branch,year,skills,phone) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(user_id) DO UPDATE SET college_name=EXCLUDED.college_name,course=EXCLUDED.course,branch=EXCLUDED.branch,year=EXCLUDED.year,skills=EXCLUDED.skills,phone=EXCLUDED.phone RETURNING *`,[id,d.college_name||null,d.course||null,d.branch||null,d.year||null,d.skills||null,d.phone||null])).rows[0];
module.exports={getByUserId,upsert};
