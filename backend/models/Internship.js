const pool=require('../config/db');
const create=async(c,d)=>{
	const internship=(await pool.query(`INSERT INTO internships(company_id,title,description,skills_required,location,stipend,duration_months,start_date,end_date,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,[c,d.title,d.description||null,d.skills_required||null,d.location||null,d.stipend||null,d.duration_months||null,d.start_date||null,d.end_date||null,d.status||'POSTED'])).rows[0];
	await pool.query(`INSERT INTO company_internship_details(internship_id,department,internship_type,eligibility) VALUES($1,$2,$3,$4) ON CONFLICT(internship_id) DO UPDATE SET department=EXCLUDED.department,internship_type=EXCLUDED.internship_type,eligibility=EXCLUDED.eligibility`,[internship.id,d.department||null,d.internship_type||'Full-time',d.eligibility||null]);
	return internship;
};
const all=async()=>(await pool.query(`SELECT i.*,c.company_name FROM internships i JOIN companies c ON c.id=i.company_id WHERE i.status='POSTED' ORDER BY i.created_at DESC`)).rows;
const one=async id=>(await pool.query(`SELECT i.*,c.company_name FROM internships i JOIN companies c ON c.id=i.company_id WHERE i.id=$1 AND i.status='POSTED'`,[id])).rows[0];
const byCompany=async c=>(await pool.query(`SELECT i.*,d.department,d.internship_type,d.eligibility,COUNT(a.id)::INTEGER AS applicant_count FROM internships i LEFT JOIN company_internship_details d ON d.internship_id=i.id LEFT JOIN applications a ON a.internship_id=i.id WHERE i.company_id=$1 GROUP BY i.id,d.department,d.internship_type,d.eligibility ORDER BY i.created_at DESC`,[c])).rows;
const update=async(id,c,d)=>{
	const internship=(await pool.query(`UPDATE internships SET title=COALESCE($1,title),description=COALESCE($2,description),skills_required=COALESCE($3,skills_required),location=COALESCE($4,location),stipend=COALESCE($5,stipend),duration_months=COALESCE($6,duration_months),start_date=COALESCE($7,start_date),end_date=COALESCE($8,end_date),status=COALESCE($9,status) WHERE id=$10 AND company_id=$11 RETURNING *`,[d.title||null,d.description||null,d.skills_required||null,d.location||null,d.stipend??null,d.duration_months??null,d.start_date||null,d.end_date||null,d.status||null,id,c])).rows[0];
	if(!internship)return null;
	await pool.query(`INSERT INTO company_internship_details(internship_id,department,internship_type,eligibility) VALUES($1,$2,$3,$4) ON CONFLICT(internship_id) DO UPDATE SET department=COALESCE(EXCLUDED.department,company_internship_details.department),internship_type=COALESCE(EXCLUDED.internship_type,company_internship_details.internship_type),eligibility=COALESCE(EXCLUDED.eligibility,company_internship_details.eligibility)`,[id,d.department||null,d.internship_type||null,d.eligibility||null]);
	return {...internship,...(await pool.query(`SELECT department,internship_type,eligibility FROM company_internship_details WHERE internship_id=$1`,[id])).rows[0]};
};
const remove=async(id,c)=>(await pool.query('DELETE FROM internships WHERE id=$1 AND company_id=$2 RETURNING id',[id,c])).rows[0];
module.exports={create,all,one,byCompany,update,remove};
