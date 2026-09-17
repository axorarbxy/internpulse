const pool=require('../config/db');
const getByUserId=async id=>(await pool.query('SELECT i.*,u.name,u.email FROM institutions i JOIN users u ON u.id=i.user_id WHERE i.user_id=$1',[id])).rows[0];
const upsert=async(id,d)=>(await pool.query(`INSERT INTO institutions(user_id,institution_name,address,contact_number) VALUES($1,$2,$3,$4) ON CONFLICT(user_id) DO UPDATE SET institution_name=EXCLUDED.institution_name,address=EXCLUDED.address,contact_number=EXCLUDED.contact_number RETURNING *`,[id,d.institution_name,d.address||null,d.contact_number||null])).rows[0];
module.exports={getByUserId,upsert};
