// EXTERNAL INTEGRATION DEPENDENCY — Module 1 (core backend) contract.
// REQUIRED CONTRACT (must be mapped to Module 1's real endpoints during integration):
//   GET {MODULE1_BASE_URL}/users/:id
//   GET {MODULE1_BASE_URL}/internships/:id
//   GET {MODULE1_BASE_URL}/internships/:id/participants
//   GET {MODULE1_BASE_URL}/internships/active
//
// While MODULE1_MODE=mock, this adapter returns seed data clearly marked as MOCK
// so Module 4 can be developed/tested independently. Swap MODULE1_MODE=live and
// implement the fetch calls once Module 1's real API is available.
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
  // LIVE MODE — implement real call once Module 1 exposes it:
  // const res = await fetch(`${config.module1BaseUrl}/users/${userId}`);
  // return res.json();
  logger.warn('module1Adapter.getUser called in live mode without implementation');
  throw new Error('Module 1 live integration not yet implemented');
}

async function getInternship(internshipId) {
  if (config.module1Mode === 'mock') {
    return MOCK_INTERNSHIPS[internshipId] || null;
  }
  throw new Error('Module 1 live integration not yet implemented');
}

async function getInternshipParticipants(internshipId) {
  if (config.module1Mode === 'mock') {
    const internship = MOCK_INTERNSHIPS[internshipId];
    if (!internship) return [];
    return [internship.studentId, internship.companyId];
  }
  throw new Error('Module 1 live integration not yet implemented');
}

async function getActiveInternships() {
  if (config.module1Mode === 'mock') {
    return Object.values(MOCK_INTERNSHIPS).filter((i) => i.status === 'ACTIVE');
  }
  throw new Error('Module 1 live integration not yet implemented');
}

module.exports = { getUser, getInternship, getInternshipParticipants, getActiveInternships };
