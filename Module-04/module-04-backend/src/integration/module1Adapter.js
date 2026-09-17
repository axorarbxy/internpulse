// EXTERNAL INTEGRATION DEPENDENCY — Module 1 (core backend) contract.
// REQUIRED CONTRACT (must be mapped to Module 1's real endpoints during integration):
//   GET {MODULE1_BASE_URL}/users/:id
//   GET {MODULE1_BASE_URL}/internships/:id
//   GET {MODULE1_BASE_URL}/internships/:id/participants
//   GET {MODULE1_BASE_URL}/internships/active
//
// While MODULE1_MODE=mock, this adapter returns seed data clearly marked as MOCK
// so Module 4 can be developed/tested independently. In live mode it calls the
// protected integration contract exposed by Module 1.
const config = require('../config/env');
const logger = require('../utils/logger');

const MOCK_USERS = {
  'student-1': { id: 'student-1', name: 'Aditi Sharma (MOCK)', role: 'STUDENT' },
  'company-1': { id: 'company-1', name: 'Acme Robotics Pvt Ltd (MOCK)', role: 'COMPANY' },
};

const MOCK_INTERNSHIPS = {
  'internship-1': {
    id: 'internship-1',
    title: 'Backend Engineering Intern (MOCK)',
    studentId: 'student-1',
    companyId: 'company-1',
    startDate: '2026-01-05',
    endDate: '2026-04-05',
    status: 'ACTIVE',
  },
};

async function getUser(userId) {
  if (config.module1Mode === 'mock') {
    return MOCK_USERS[userId] || { id: userId, name: `Unknown User (MOCK ${userId})`, role: 'UNKNOWN' };
  }
  return requestModule1(`/api/integration/users/${encodeURIComponent(userId)}`);
}

async function getInternship(internshipId) {
  if (config.module1Mode === 'mock') {
    return MOCK_INTERNSHIPS[internshipId] || null;
  }
  return requestModule1(`/api/integration/internships/${encodeURIComponent(internshipId)}`);
}

async function getInternshipParticipants(internshipId) {
  if (config.module1Mode === 'mock') {
    const internship = MOCK_INTERNSHIPS[internshipId];
    if (!internship) return [];
    return [internship.studentId, internship.companyId];
  }
  const response = await requestModule1(`/api/integration/internships/${encodeURIComponent(internshipId)}/participants`);
  return response.participants || [];
}

async function getActiveInternships() {
  if (config.module1Mode === 'mock') {
    return Object.values(MOCK_INTERNSHIPS).filter((i) => i.status === 'ACTIVE');
  }
  const response = await requestModule1('/api/integration/internships/active');
  return response.internships || [];
}

async function requestModule1(path) {
  if (!config.module1BaseUrl) {
    throw new Error('MODULE1_BASE_URL is required when MODULE1_MODE=live');
  }

  const response = await fetch(`${config.module1BaseUrl.replace(/\/$/, '')}${path}`, {
    headers: {
      Accept: 'application/json',
      'X-Internal-Service-Key': config.module1ServiceToken,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || `Module 1 returned ${response.status}`);
    error.statusCode = response.status;
    logger.warn('Module 1 request failed', { path, status: response.status });
    throw error;
  }
  return payload;
}

module.exports = { getUser, getInternship, getInternshipParticipants, getActiveInternships };
