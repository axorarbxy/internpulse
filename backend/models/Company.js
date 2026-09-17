const pool=require('../config/db');
const getByUserId=async id=>(await pool.query('SELECT c.*,u.name,u.email FROM companies c JOIN users u ON u.id=c.user_id WHERE c.user_id=$1',[id])).rows[0];
const getById=async id=>(await pool.query('SELECT * FROM companies WHERE id=$1',[id])).rows[0];
const upsert=async(id,d)=>(await pool.query(`INSERT INTO companies(user_id,company_name,industry,website,location,description) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(user_id) DO UPDATE SET company_name=EXCLUDED.company_name,industry=EXCLUDED.industry,website=EXCLUDED.website,location=EXCLUDED.location,description=EXCLUDED.description RETURNING *`,[id,d.company_name,d.industry||null,d.website||null,d.location||null,d.description||null])).rows[0];
module.exports={getByUserId,getById,upsert};
