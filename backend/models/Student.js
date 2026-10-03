const pool=require('../config/db');
const getByUserId=async id=>(await pool.query('SELECT s.*,u.name,u.email FROM students s JOIN users u ON u.id=s.user_id WHERE s.user_id=$1',[id])).rows[0];
const byInstitution=async institutionId=>(await pool.query(`
	SELECT s.user_id AS student_id,u.name,u.email,s.branch,s.course,s.year,
				 current_application.title AS internship_title,
				 current_application.company_name,current_application.status AS application_status,
				 current_application.applied_at,current_application.progress_data,
				 application_stats.active_internships,application_stats.completed_internships,
				 application_stats.company_partners
	FROM students s
	JOIN users u ON u.id=s.user_id
	JOIN student_institution_memberships membership ON membership.student_user_id=s.user_id
	LEFT JOIN LATERAL (
		SELECT COUNT(*) FILTER (WHERE a.status='ONGOING')::INTEGER AS active_internships,
				   COUNT(*) FILTER (WHERE a.status='COMPLETED')::INTEGER AS completed_internships,
				   ARRAY_AGG(DISTINCT c.company_name ORDER BY c.company_name)
					FILTER (WHERE c.company_name IS NOT NULL) AS company_partners
		FROM applications a
		JOIN internships i ON i.id=a.internship_id
		JOIN companies c ON c.id=i.company_id
		WHERE a.student_id=s.id
	) application_stats ON TRUE
	LEFT JOIN LATERAL (
		SELECT i.title,c.company_name,a.status,a.applied_at,progress.progress_data
		FROM applications a
		JOIN internships i ON i.id=a.internship_id
		JOIN companies c ON c.id=i.company_id
		LEFT JOIN student_internship_progress progress ON progress.application_id=a.id
		WHERE a.student_id=s.id
		ORDER BY CASE a.status
			WHEN 'ONGOING' THEN 0
			WHEN 'COMPLETED' THEN 1
			WHEN 'SELECTED' THEN 2
			WHEN 'APPLIED' THEN 3
			ELSE 4
		END,a.updated_at DESC,a.id DESC
		LIMIT 1
	) current_application ON TRUE
	WHERE membership.institution_id=$1
	ORDER BY u.name`,[institutionId])).rows;
const assignInstitution=async(userId,institutionId,assignedBy)=>{
	const student=(await pool.query("SELECT user_id FROM students s JOIN users u ON u.id=s.user_id WHERE s.user_id=$1 AND u.role='STUDENT'",[userId])).rows[0];
	if(!student)return null;
	if(institutionId===null){
		await pool.query('DELETE FROM student_institution_memberships WHERE student_user_id=$1',[userId]);
		return student;
	}
	return (await pool.query(`INSERT INTO student_institution_memberships(student_user_id,institution_id,assigned_by)
		VALUES($1,$2,$3) ON CONFLICT(student_user_id) DO UPDATE SET institution_id=EXCLUDED.institution_id,assigned_by=EXCLUDED.assigned_by,assigned_at=CURRENT_TIMESTAMP
		RETURNING student_user_id AS user_id`,[userId,institutionId,assignedBy])).rows[0];
};
const upsert=async(id,d)=>(await pool.query(`INSERT INTO students(user_id,college_name,course,branch,year,skills,phone) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(user_id) DO UPDATE SET college_name=EXCLUDED.college_name,course=EXCLUDED.course,branch=EXCLUDED.branch,year=EXCLUDED.year,skills=EXCLUDED.skills,phone=EXCLUDED.phone RETURNING *`,[id,d.college_name||null,d.course||null,d.branch||null,d.year||null,d.skills||null,d.phone||null])).rows[0];
module.exports={getByUserId,byInstitution,assignInstitution,upsert};
