const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
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

router.get('/dashboard/:studentId', forward((req) => studentDashboard(req.params.studentId)));
router.get('/recommendations/:studentId', forward((req) => request(
  'recommendations', `/recommendations/${encodeURIComponent(req.params.studentId)}?limit=${req.query.limit || 10}`
)));
router.get('/skill-gaps/:studentId', forward((req) => request(
  'recommendations', `/skill-gaps/${encodeURIComponent(req.params.studentId)}`
)));

router.post('/chat', forward((req) => jsonRequest('chatbot', '/chat', 'POST', req.body)));
router.get('/chat/history/:studentId', forward((req) => request(
  'chatbot', `/chat/history/${encodeURIComponent(req.params.studentId)}${req.query.session_id ? `?session_id=${encodeURIComponent(req.query.session_id)}` : ''}`
)));
router.post('/chat/escalate', forward((req) => jsonRequest('chatbot', '/chat/escalate', 'POST', req.body)));

router.post('/feedback', forward((req) => jsonRequest('feedback', '/feedback', 'POST', req.body)));
router.get('/feedback/:companyId/score', forward((req) => request(
  'feedback', `/companies/${encodeURIComponent(req.params.companyId)}/score`
)));
router.get('/feedback/:companyId/themes', forward((req) => request(
  'feedback', `/companies/${encodeURIComponent(req.params.companyId)}/themes`
)));

router.post('/grievances', forward((req) => jsonRequest('grievance', '/grievances', 'POST', req.body)));
router.get('/grievances', forward((req) => request(
  'grievance', `/grievances${req.query.studentId ? `?studentId=${encodeURIComponent(req.query.studentId)}` : ''}`
)));
router.get('/grievances/:grievanceId', forward((req) => request(
  'grievance', `/grievances/${encodeURIComponent(req.params.grievanceId)}`
)));
router.patch('/grievances/:grievanceId/status', forward((req) => jsonRequest(
  'grievance', `/grievances/${encodeURIComponent(req.params.grievanceId)}/status`, 'PATCH', req.body
)));

router.post('/fraud/content', forward((req) => jsonRequest('fraud', '/analyze/content', 'POST', req.body)));
router.post('/fraud/activity/:internshipId', forward((req) => jsonRequest(
  'fraud', `/analyze/activity/${encodeURIComponent(req.params.internshipId)}`, 'POST', req.body
)));
router.post('/fraud/document', forward((req) => jsonRequest('fraud', '/handoffs/document', 'POST', req.body)));
router.get('/fraud/flags', forward((req) => request(
  'fraud', `/flags${req.query.status ? `?status=${encodeURIComponent(req.query.status)}` : ''}`
)));
router.patch('/fraud/flags/:flagId/resolve', forward((req) => jsonRequest(
  'fraud', `/flags/${encodeURIComponent(req.params.flagId)}/resolve`, 'PATCH', req.body
)));

module.exports = router;
