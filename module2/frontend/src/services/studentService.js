import {
  mockStudentProfile,
  mockStudentStats,
  mockActiveInternship,
  mockDeadlines,
  mockRecentApplications,
  mockRecommendedInternships,
  mockStudentAnalytics,
  mockCertificates,
} from '../data/mockStudentData';

// Simulated latency to mimic realistic API calls without inventing backend logic
const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

export const studentService = {
  async getStudentProfile() {
    await delay();
    return { ...mockStudentProfile };
  },

  async getStudentStats() {
    await delay();
    return { ...mockStudentStats };
  },

  async getActiveInternship() {
    await delay();
    return { ...mockActiveInternship };
  },

  async getUpcomingDeadlines() {
    await delay();
    return [...mockDeadlines];
  },

  async getRecentApplications() {
    await delay();
    return [...mockRecentApplications];
  },

  async getRecommendedInternships() {
    await delay();
    return [...mockRecommendedInternships];
  },

  async getStudentAnalytics() {
    await delay(150);
    return { ...mockStudentAnalytics };
  },

  async getStudentCertificates() {
    await delay(150);
    return [...mockCertificates];
  },

  async getStudentDashboardData() {
    await delay(150);
    return {
      profile: { ...mockStudentProfile },
      stats: { ...mockStudentStats },
      activeInternship: { ...mockActiveInternship },
      deadlines: [...mockDeadlines],
      recentApplications: [...mockRecentApplications],
      recommendedInternships: [...mockRecommendedInternships],
    };
  },
};

export default studentService;
