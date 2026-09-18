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

function createDashboardProfile(profile, localUser, studentId) {
  const defaultSkills = ['React', 'Node.js', 'PostgreSQL', 'REST APIs', 'Git'];
  const rawSkills = profile?.skills;
  const skills = Array.isArray(rawSkills)
    ? rawSkills
    : typeof rawSkills === 'string'
      ? rawSkills.split(',').map((skill) => skill.trim()).filter(Boolean)
      : defaultSkills;

  return {
    id: profile?.id || `STU-${studentId}`,
    name: profile?.name || localUser.name || 'Student',
    avatar: profile?.avatar || 'https://ui-avatars.com/api/?background=4f46e5&color=fff&name=Student',
    email: profile?.email || localUser.email || '',
    university: profile?.college_name || 'InternPulse Partner Institution',
    department: profile?.branch || profile?.course || 'Computer Science',
    degree: profile?.course || 'Bachelor of Technology',
    year: profile?.year ? `Year ${profile.year}` : 'Year 3',
    gpa: profile?.gpa || '—',
    targetRole: profile?.target_role || 'Internship Candidate',
    profileCompleteness: profile?.profile_completeness || 60,
    skills: skills.length ? skills : defaultSkills,
    verifiedCredentials: Number(profile?.verified_credentials || 0),
  };
}

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

    const profile = createDashboardProfile(
      profileRes.status === 'fulfilled' ? profileRes.value?.profile : null,
      localUser,
      studentId,
    );

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
