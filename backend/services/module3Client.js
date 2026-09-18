const serviceUrls = {
  recommendations: process.env.RECOMMENDATION_API_URL || 'http://localhost:8001',
  chatbot: process.env.CHATBOT_API_URL || 'http://localhost:8002',
  grievance: process.env.GRIEVANCE_API_URL || 'http://localhost:8003',
  feedback: process.env.FEEDBACK_API_URL || 'http://localhost:8004',
  fraud: process.env.FRAUD_API_URL || 'http://localhost:8005'
};

async function request(service, path, options = {}) {
  const response = await fetch(`${serviceUrls[service]}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.detail || payload.message || `Module ${service} returned ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

function jsonRequest(service, path, method, body) {
  return request(service, path, { method, body: JSON.stringify(body) });
}

async function studentDashboard(studentId) {
  const results = await Promise.allSettled([
    request('recommendations', `/recommendations/${encodeURIComponent(studentId)}`),
    request('recommendations', `/skill-gaps/${encodeURIComponent(studentId)}`),
    request('grievance', `/grievances?studentId=${encodeURIComponent(studentId)}`),
    request('fraud', '/flags')
  ]);
  const [recommendations, skillGaps, grievances, fraudFlags] = results;
  return {
    recommendations: recommendations.status === 'fulfilled' ? recommendations.value : null,
    skill_gaps: skillGaps.status === 'fulfilled' ? skillGaps.value : null,
    grievances: grievances.status === 'fulfilled' ? grievances.value : null,
    fraud_flags: fraudFlags.status === 'fulfilled'
      ? { ...fraudFlags.value, flags: (fraudFlags.value?.flags || []).filter((flag) => flag.student_id === studentId) }
      : null,
    services: {
      recommendations: recommendations.status === 'fulfilled',
      grievance: grievances.status === 'fulfilled',
      fraud: fraudFlags.status === 'fulfilled'
    }
  };
}

module.exports = { request, jsonRequest, studentDashboard };
