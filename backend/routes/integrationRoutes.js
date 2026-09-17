const router = require('express').Router();
const pool = require('../config/db');
const internalService = require('../middleware/internalService');

router.use(internalService);

router.get('/users/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, role FROM users WHERE id = $1',
      [req.params.userId]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'User not found' });
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load user' });
  }
});

router.get('/students/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.user_id AS student_id, s.skills, s.course, s.branch, s.year
       FROM students s WHERE s.user_id = $1`,
      [req.params.userId]
    );
    const student = result.rows[0];
    if (!student) return res.status(404).json({ message: 'Student profile not found' });
    return res.json({
      student_id: String(student.student_id),
      skills: String(student.skills || '').split(',').map((skill) => skill.trim()).filter(Boolean),
      target_domain: student.branch || student.course || null,
      resume_text: null,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load student profile' });
  }
});

router.get('/internships', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.id, i.title, i.description, i.skills_required, i.start_date, i.end_date,
              i.status, c.company_name, c.user_id AS company_user_id
       FROM internships i JOIN companies c ON c.id = i.company_id
       WHERE i.status = 'POSTED' ORDER BY i.created_at DESC`
    );
    return res.json({ internships: result.rows.map(toRecommendationInternship) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load internships' });
  }
});

router.get('/internships/active', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.id, i.title, i.description, i.skills_required, i.start_date, i.end_date,
              i.status, c.company_name, c.user_id AS company_user_id,
              s.user_id AS student_user_id
       FROM internships i
       JOIN companies c ON c.id = i.company_id
       LEFT JOIN applications a ON a.internship_id = i.id AND a.status = 'ONGOING'
       LEFT JOIN students s ON s.id = a.student_id
       WHERE i.status = 'POSTED' AND a.id IS NOT NULL`
    );
    return res.json({ internships: result.rows.map(toModule4Internship) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load active internships' });
  }
});

router.get('/internships/:internshipId/participants', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.user_id AS student_user_id, c.user_id AS company_user_id
       FROM internships i
       JOIN companies c ON c.id = i.company_id
       LEFT JOIN applications a ON a.internship_id = i.id
       LEFT JOIN students s ON s.id = a.student_id
       WHERE i.id = $1`,
      [req.params.internshipId]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Internship not found' });
    const participants = result.rows.flatMap((row) => [row.student_user_id, row.company_user_id]).filter(Boolean);
    return res.json({ participants: [...new Set(participants.map(String))] });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load participants' });
  }
});

router.get('/internships/:internshipId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.id, i.title, i.description, i.start_date, i.end_date, i.status,
              c.user_id AS company_user_id, s.user_id AS student_user_id
       FROM internships i
       JOIN companies c ON c.id = i.company_id
       LEFT JOIN applications a ON a.internship_id = i.id AND a.status IN ('SELECTED', 'ONGOING', 'COMPLETED')
       LEFT JOIN students s ON s.id = a.student_id
       WHERE i.id = $1`,
      [req.params.internshipId]
    );
    const internship = result.rows[0];
    if (!internship) return res.status(404).json({ message: 'Internship not found' });
    return res.json(toModule4Internship(internship));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load internship' });
  }
});

function toRecommendationInternship(internship) {
  return {
    internship_id: String(internship.id),
    company: internship.company_name,
    title: internship.title,
    domain: internship.description || 'software engineering',
    required_skills: String(internship.skills_required || '').split(',').map((skill) => skill.trim()).filter(Boolean),
    description: internship.description || '',
  };
}

function toModule4Internship(internship) {
  return {
    id: String(internship.id),
    title: internship.title,
    studentId: internship.student_user_id ? String(internship.student_user_id) : null,
    companyId: internship.company_user_id ? String(internship.company_user_id) : null,
    startDate: internship.start_date,
    endDate: internship.end_date,
    status: internship.status === 'POSTED' ? 'ACTIVE' : internship.status,
  };
}

module.exports = router;
