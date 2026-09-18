import apiRequest from './api';

function getStudentId() {
  let studentId = window.localStorage.getItem('internpulse_student_id');
  if (!studentId) {
    const userStr = window.localStorage.getItem('internpulse_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.id) {
          studentId = String(user.id);
          window.localStorage.setItem('internpulse_student_id', studentId);
        }
      } catch {
        // fallback
      }
    }
  }
  return studentId || '1';
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

  async updateStudentProfile(data) {
    const response = await apiRequest('/students/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
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
    try {
      return await apiRequest(`/intelligence/recommendations/${encodeURIComponent(getStudentId())}`);
    } catch {
      return { recommendations: [] };
    }
  },

  async getStudentAnalytics() {
    const dashboard = await this.getStudentDashboardData();
    return dashboard.analytics;
  },

  async getStudentCertificates() {
    try {
      const response = await apiRequest('/certificates/my');
      return (response.certificates || response || []).map((certificate) => ({
        ...certificate,
        id: certificate.certificate_number,
        title: certificate.title,
        company: certificate.company_name,
        status: certificate.verified ? 'Verified' : 'Pending Verification',
      }));
    } catch {
      return [];
    }
  },

  async getStudentDashboardData() {
    const studentId = getStudentId();
    const localUser = JSON.parse(window.localStorage.getItem('internpulse_user') || '{}');

    const [profileRes, intelligenceRes, applicationsRes] = await Promise.allSettled([
      apiRequest('/students/profile'),
      apiRequest(`/intelligence/dashboard/${encodeURIComponent(studentId)}`),
      apiRequest('/applications/my'),
    ]);

    const profile = profileRes.status === 'fulfilled' && profileRes.value?.profile
      ? profileRes.value.profile
      : {
          name: localUser.name || 'Student',
          college_name: 'Apex Institute of Technology',
          course: 'B.Tech',
          branch: 'Computer Science',
          year: 'Year 3',
          skills: 'Python, React, SQL',
        };

    const intelligence = intelligenceRes.status === 'fulfilled' && intelligenceRes.value
      ? intelligenceRes.value
      : {};

    const applications = applicationsRes.status === 'fulfilled' && applicationsRes.value?.applications
      ? applicationsRes.value.applications
      : [];

    const completed = applications.filter((application) => application.status === 'COMPLETED');
    const active = applications.find((application) => application.status === 'ONGOING' || application.status === 'SELECTED');

    const stats = {
      ...emptyDashboard.stats,
      totalApplications: applications.length,
      shortlistedApplications: applications.filter((application) => application.status === 'SELECTED').length,
      activeInternshipCount: active ? 1 : 0,
      activeInternshipCompany: active?.company_name || emptyDashboard.stats.activeInternshipCompany,
      completedInternships: completed.length,
    };

    return {
      profile,
      stats,
      activeInternship: active ? {
        ...emptyDashboard.activeInternship,
        company: active.company_name || 'Active Internship',
        role: active.title || 'Intern',
      } : emptyDashboard.activeInternship,
      deadlines: intelligence.deadlines || [],
      recentApplications: applications,
      recommendedInternships: intelligence.recommendations?.recommendations || [],
      analytics: intelligence.analytics || {},
    };
  },
};

export default studentService;
