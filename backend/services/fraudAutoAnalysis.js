const { request } = require('./module3Client');

const activityThrottle = new Map();

function autoAnalysisEnabled() {
  return process.env.FRAUD_AUTO_ANALYSIS !== 'false';
}

function shouldAnalyzeActivity(internshipId) {
  if (!autoAnalysisEnabled()) return false;
  const now = Date.now();
  const previous = activityThrottle.get(internshipId) || 0;
  if (now - previous < 10 * 60 * 1000) {
    return false;
  }
  activityThrottle.set(internshipId, now);
  return true;
}

async function triggerContentAnalysis({ studentId, submissionId, content, metadata = {}, internshipId }) {
  if (!autoAnalysisEnabled()) return null;

  const payload = {
    student_id: studentId,
    internship_id: internshipId || null,
    submission_id: submissionId,
    content,
    metadata,
    source: 'core-backend',
    created_at: new Date().toISOString(),
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);

  try {
    return await request('fraud', '/analyze/content', {
      method: 'POST',
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    console.error('[fraud-auto-analysis] content analysis failed:', error.message || error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function triggerActivityAnalysis({ internshipId, studentId, events = [], deadline }) {
  if (!autoAnalysisEnabled() || !internshipId || !shouldAnalyzeActivity(String(internshipId))) {
    return null;
  }

  const payload = {
    student_id: studentId,
    internship_id: internshipId,
    deadline,
    events,
    analyzed_at: new Date().toISOString(),
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);

  try {
    return await request('fraud', `/analyze/activity/${encodeURIComponent(internshipId)}`, {
      method: 'POST',
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    console.error('[fraud-auto-analysis] activity analysis failed:', error.message || error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

module.exports = {
  autoAnalysisEnabled,
  triggerContentAnalysis,
  triggerActivityAnalysis,
};
