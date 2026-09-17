import apiRequest from './api';

function getStudentId() {
  const studentId = window.localStorage.getItem('internpulse_student_id');
  if (!studentId) {
    throw new Error('Sign in as a student to load this dashboard.');
  }
  return studentId;
}

const emptyDashboard = {
  stats: {
    totalApplications: 0,
    applicationsTrend: 'No application history yet',
    shortlistedApplications: 0,
    shortlistedRate: '0% shortlist rate',
    activeInternshipCount: 0,
    activeInternshipCompany: 'No active internship',
    completedInternships: 0,
    completedCertificates: '0 verified certificates',
  },
  activeInternship: {
    company: 'No active internship',
    role: 'Start by applying to an internship',
    companyLogo: '?',
    department: '',
    location: '',
    stipend: 'N/A',
    progressPercentage: 0,
    currentWeek: 0,
    totalDurationWeeks: 0,
    totalHoursCompleted: 0,
    totalHoursRequired: 0,
    mentorName: 'Not assigned',
    mentorRole: '',
    milestones: [],
  },
};

export const studentService = {
  async getStudentProfile() {
    const response = await apiRequest('/students/profile');
    return response.profile;
  },

  async getStudentStats() {
    const dashboard = await this.getStudentDashboardData();
    return dashboard.stats;
  },

  async getActiveInternship() {
    const dashboard = await this.getStudentDashboardData();
    return dashboard.activeInternship;
  },

  async getUpcomingDeadlines() {
    const dashboard = await this.getStudentDashboardData();
    return dashboard.deadlines;
  },

  async getRecentApplications() {
    const dashboard = await this.getStudentDashboardData();
    return dashboard.recentApplications;
  },

  async getRecommendedInternships() {
    return apiRequest(`/intelligence/recommendations/${encodeURIComponent(getStudentId())}`);
  },

  async getStudentAnalytics() {
    const dashboard = await this.getStudentDashboardData();
    return dashboard.analytics;
  },

  async getStudentCertificates() {
    const response = await apiRequest('/certificates/my');
    return (response.certificates || response).map((certificate) => ({
      ...certificate,
      id: certificate.certificate_number,
      title: certificate.title,
      company: certificate.company_name,
      status: certificate.verified ? 'Verified' : 'Pending Verification',
    }));
  },

  async getStudentDashboardData() {
    const studentId = getStudentId();
    const [profileResponse, intelligence] = await Promise.all([
      apiRequest('/students/profile'),
      apiRequest(`/intelligence/dashboard/${encodeURIComponent(studentId)}`),
    ]);

    if (!profileResponse.profile) {
      throw new Error('Complete your student profile before opening the dashboard.');
    }

    const applicationsResponse = await apiRequest('/applications/my');
    const applications = applicationsResponse.applications || [];
    const completed = applications.filter((application) => application.status === 'COMPLETED');
    const active = applications.find((application) => application.status === 'ONGOING');
    const stats = {
      ...emptyDashboard.stats,
      totalApplications: applications.length,
      shortlistedApplications: applications.filter((application) => application.status === 'SELECTED').length,
      activeInternshipCount: active ? 1 : 0,
      activeInternshipCompany: active?.company_name || emptyDashboard.stats.activeInternshipCompany,
      completedInternships: completed.length,
    };

    return {
      profile: profileResponse.profile,
      stats,
      activeInternship: active ? {
        ...emptyDashboard.activeInternship,
        company: active.company_name,
        role: active.title,
      } : emptyDashboard.activeInternship,
      deadlines: intelligence.deadlines || [],
      recentApplications: applications,
      recommendedInternships: intelligence.recommendations?.recommendations || [],
      analytics: intelligence.analytics || {},
    };
  },
};

export default studentService;
