const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const Company = require('../models/Company');
const Internship = require('../models/Internship');
const Student = require('../models/Student');
const Application = require('../models/Application');
const { request, jsonRequest, studentDashboard } = require('../services/module3Client');

function forward(handler) {
  return async (req, res) => {
    try {
      res.json(await handler(req));
    } catch (error) {
      res.status(error.status || 502).json({ message: error.message });
    }
  };
}

router.use(auth);

function requireOwnStudentParam(req, res, next) {
  if (String(req.params.studentId) !== String(req.user.id)) {
    return res.status(403).json({ message: 'You can only access your own student data' });
  }
  return next();
}

function bindOwnStudentBody(req, res, next) {
  const requestedId = req.body.student_id || req.body.studentId;
  if (requestedId && String(requestedId) !== String(req.user.id)) {
    return res.status(403).json({ message: 'You can only submit data for your own account' });
  }
  req.body = { ...req.body, student_id: String(req.user.id) };
  return next();
}

async function loadOwnCompany(req, res, next) {
  try {
    const company = await Company.getByUserId(req.user.id);
    if (!company) return res.status(403).json({ message: 'Company profile required' });
    if (req.params.companyId) {
      const requestedId = String(req.params.companyId);
      if (![String(company.id), String(company.user_id)].includes(requestedId)) {
        return res.status(403).json({ message: 'You can only access your own company data' });
      }
    }
    req.company = company;
    return next();
  } catch {
    return res.status(503).json({ message: 'Unable to verify company ownership' });
  }
}

router.get('/dashboard/:studentId', authorize('STUDENT'), requireOwnStudentParam, forward((req) => studentDashboard(req.user.id)));
router.get('/recommendations/:studentId', authorize('STUDENT'), requireOwnStudentParam, forward((req) => request(
  'recommendations', `/recommendations/${encodeURIComponent(req.params.studentId)}?limit=${req.query.limit || 10}`
)));
router.get('/skill-gaps/:studentId', authorize('STUDENT'), requireOwnStudentParam, forward((req) => request(
  'recommendations', `/skill-gaps/${encodeURIComponent(req.params.studentId)}`
)));

router.post('/chat', authorize('STUDENT'), bindOwnStudentBody, forward((req) => jsonRequest('chatbot', '/chat', 'POST', req.body)));
router.get('/chat/history/:studentId', authorize('STUDENT'), requireOwnStudentParam, forward((req) => request(
  'chatbot', `/chat/history/${encodeURIComponent(req.params.studentId)}${req.query.session_id ? `?session_id=${encodeURIComponent(req.query.session_id)}` : ''}`
)));
router.post('/chat/escalate', authorize('STUDENT'), bindOwnStudentBody, forward((req) => jsonRequest('chatbot', '/chat/escalate', 'POST', req.body)));

router.post('/feedback', authorize('COMPANY'), loadOwnCompany, async (req, res) => {
  const studentId = String(req.body.student_id || '');
  if (!studentId || !await Application.hasCompanyStudent(req.company.id, studentId)) {
    return res.status(403).json({ message: 'You can only review students who applied to your company' });
  }
  return forward(() => jsonRequest('feedback', '/feedback', 'POST', {
    ...req.body,
    company_id: String(req.company.id),
    student_id: studentId,
    direction: 'COMPANY_TO_STUDENT',
  }))(req, res);
});
router.post('/feedback/student', authorize('STUDENT'), bindOwnStudentBody, async (req, res) => {
  const student = await Student.getByUserId(req.user.id);
  const company = await Company.getById(Number(req.body.company_id));
  if (!student || !company || !await Application.hasCompanyStudent(company.id, req.user.id)) {
    return res.status(403).json({ message: 'Feedback can only be submitted for a company you have applied to' });
  }
  return forward(() => jsonRequest('feedback', '/feedback', 'POST', {
    ...req.body,
    company_id: String(company.id),
    student_id: String(req.user.id),
    direction: 'STUDENT_TO_COMPANY',
  }))(req, res);
});
router.get('/feedback/student/my', authorize('STUDENT'), forward((req) => request(
  'feedback', `/students/${encodeURIComponent(req.user.id)}/feedback`
)));
router.get('/feedback/:companyId/records', authorize('COMPANY'), loadOwnCompany, forward((req) => request(
  'feedback', `/companies/${encodeURIComponent(req.company.id)}/feedback`
)));
router.get('/feedback/:companyId/score', authorize('COMPANY'), loadOwnCompany, forward((req) => request(
  'feedback', `/companies/${encodeURIComponent(req.params.companyId)}/score`
)));
router.get('/feedback/:companyId/themes', authorize('COMPANY'), loadOwnCompany, forward((req) => request(
  'feedback', `/companies/${encodeURIComponent(req.params.companyId)}/themes`
)));

router.post('/grievances', authorize('STUDENT'), bindOwnStudentBody, forward((req) => jsonRequest('grievance', '/grievances', 'POST', req.body)));
router.get('/grievances', authorize('STUDENT'), forward((req) => request(
  'grievance', `/grievances?studentId=${encodeURIComponent(req.user.id)}`
)));
router.get('/admin/grievances', authorize('ADMIN'), forward(() => request('grievance', '/grievances')));
router.get('/grievances/:grievanceId', authorize('ADMIN'), forward((req) => request(
  'grievance', `/grievances/${encodeURIComponent(req.params.grievanceId)}`
)));
router.patch('/grievances/:grievanceId/status', authorize('ADMIN'), forward((req) => jsonRequest(
  'grievance', `/grievances/${encodeURIComponent(req.params.grievanceId)}/status`, 'PATCH', req.body
)));

router.post('/fraud/content', authorize('STUDENT'), bindOwnStudentBody, forward((req) => jsonRequest('fraud', '/analyze/content', 'POST', req.body)));
router.post('/fraud/activity/:internshipId', authorize('COMPANY'), loadOwnCompany, async (req, res, next) => {
  try {
    const internship = await Internship.one(req.params.internshipId);
    if (!internship || internship.company_id !== req.company.id) {
      return res.status(404).json({ message: 'Internship not found' });
    }
    return forward((requestReq) => jsonRequest(
      'fraud', `/analyze/activity/${encodeURIComponent(req.params.internshipId)}`, 'POST', requestReq.body
    ))(req, res, next);
  } catch {
    return res.status(503).json({ message: 'Unable to verify internship ownership' });
  }
});
router.post('/fraud/document', authorize('ADMIN'), forward((req) => jsonRequest('fraud', '/handoffs/document', 'POST', req.body)));
router.get('/fraud/flags', authorize('ADMIN'), forward((req) => request(
  'fraud', `/flags${req.query.status ? `?status=${encodeURIComponent(req.query.status)}` : ''}`
)));
router.patch('/fraud/flags/:flagId/resolve', authorize('ADMIN'), forward((req) => jsonRequest(
  'fraud', `/flags/${encodeURIComponent(req.params.flagId)}/resolve`, 'PATCH', {
    ...req.body,
    reviewed_by: String(req.user.id),
  }
)));

module.exports = router;
