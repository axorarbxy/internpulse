import apiRequest, { API_BASE_URL, getAuthToken } from './api';
import {
  demoStudentPreferences,
  demoStudentProfile,
  demoStudentProjects,
  demoStudentResume,
} from '../data/demoStudentProfile';

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
  analytics: {
    summary: {
      totalApplications: 0,
      applicationsTrend: 'No application history yet',
      shortlisted: 0,
      shortlistedTrend: '0% shortlist rate',
      pending: 0,
      pendingTrend: 'No pending applications',
      rejected: 0,
      rejectedTrend: '0% rejection rate',
      offers: 0,
      totalHoursLogged: 0,
      requiredHours: 0,
      hoursCompletionPercent: 0,
      avgResponseDays: 0,
    },
    applicationsOverTime: [],
    statusDistribution: [],
    weeklyHoursProgress: [],
    skillsProficiency: [],
    domainDistribution: [],
  },
};

function readStoredValue(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function createDashboardProfile(profile, localUser, studentId) {
  const savedProfile = { ...demoStudentProfile, ...readStoredValue('internpulse_profile', {}) };
  const preferences = { ...demoStudentPreferences, ...readStoredValue('internpulse_profile_preferences', {}) };
  const projects = readStoredValue('internpulse_profile_projects', demoStudentProjects);
  const resume = readStoredValue('internpulse_resume', demoStudentResume);
  const defaultSkills = ['React', 'Node.js', 'PostgreSQL', 'REST APIs', 'Git'];
  const rawSkills = profile?.skills;
  const skills = Array.isArray(rawSkills)
    ? rawSkills
    : typeof rawSkills === 'string'
      ? rawSkills.split(',').map((skill) => skill.trim()).filter(Boolean)
      : defaultSkills;
  const safeSkills = Array.isArray(skills) && skills.length ? skills : defaultSkills;
  const completenessChecks = [
    Boolean((profile?.name || savedProfile.name || localUser.name) && (profile?.email || savedProfile.email || localUser.email) && (profile?.phone || savedProfile.phone) && savedProfile.location),
    Boolean((profile?.branch || savedProfile.branch) && (profile?.year || savedProfile.semester) && (profile?.college_name || savedProfile.college)),
    skills.length > 0,
    projects.length > 0,
    Boolean(resume),
    Boolean(preferences.targetRoles && preferences.workModes),
    Boolean(savedProfile.github || savedProfile.linkedin || savedProfile.portfolio),
  ];
  const computedCompleteness = Math.round((completenessChecks.filter(Boolean).length / completenessChecks.length) * 100);

  return {
    id: profile?.id || `STU-${studentId}`,
    name: profile?.name || localUser.name || 'Student',
    avatar: profile?.avatar || 'https://ui-avatars.com/api/?background=4f46e5&color=fff&name=Student',
    email: profile?.email || localUser.email || '',
    university: profile?.college_name || savedProfile.college || 'InternPulse Partner Institution',
    department: profile?.branch || savedProfile.branch || profile?.course || 'Computer Science',
    degree: profile?.course || 'Bachelor of Technology',
    year: profile?.year ? `Year ${profile.year}` : 'Year 3',
    gpa: profile?.gpa || savedProfile.gpa || '—',
    targetRole: profile?.target_role || preferences.targetRoles?.split(',')[0]?.trim() || 'Internship Candidate',
    profileCompleteness: profile?.profile_completeness || computedCompleteness,
    skills: safeSkills,
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
      const response = await apiRequest(`/intelligence/recommendations/${encodeURIComponent(getStudentId())}`);
      const recommendations = (response.recommendations || []).map((recommendation) => ({
        ...recommendation,
        score: recommendation.score || 0,
        matched_skills: recommendation.matched_skills || recommendation.matchedSkills || [],
        missing_skills: recommendation.missing_skills || recommendation.missingSkills || [],
        skills: recommendation.skills || recommendation.required_skills || [],
      }));
      if (recommendations.length) return {
        ...response,
        recommendations,
      };
    } catch {
      // Continue with deterministic profile-skill matching when the AI service is offline.
    }

    try {
      const [internshipResponse, profileResponse] = await Promise.all([
        apiRequest('/internships'),
        apiRequest('/students/profile'),
      ]);
      const savedProfile = readStoredValue('internpulse_profile', {});
      const studentSkills = String(profileResponse.profile?.skills || savedProfile.skills || '')
        .split(',').map((skill) => skill.trim().toLowerCase()).filter(Boolean);
      const recommendations = (internshipResponse.internships || []).map((internship) => {
        const skills = Array.isArray(internship.skills_required)
          ? internship.skills_required
          : String(internship.skills_required || '').split(',').map((skill) => skill.trim()).filter(Boolean);
        const matchedSkills = skills.filter((skill) => studentSkills.includes(skill.toLowerCase()));
        return {
          internship_id: internship.id,
          title: internship.title,
          company: internship.company_name || 'Company',
          domain: internship.description || 'Internship opportunity',
          score: skills.length ? 0.45 + (0.55 * matchedSkills.length / skills.length) : 0.45,
          matched_skills: matchedSkills,
          missing_skills: skills.filter((skill) => !matchedSkills.includes(skill)),
          required_skills: skills,
          source: 'profile-skill-overlap',
        };
      }).sort((left, right) => right.score - left.score).slice(0, 6);
      return { recommendations };
    } catch {
      return { recommendations: [] };
    }
  },

  async getStudentAnalytics() {
    const dashboard = await this.getStudentDashboardData();
    return {
      ...emptyDashboard.analytics,
      ...dashboard.analytics,
      summary: {
        ...emptyDashboard.analytics.summary,
        ...(dashboard.analytics?.summary || {}),
      },
      applicationsOverTime: dashboard.analytics?.applicationsOverTime || [],
      statusDistribution: dashboard.analytics?.statusDistribution || [],
      weeklyHoursProgress: dashboard.analytics?.weeklyHoursProgress || [],
      skillsProficiency: dashboard.analytics?.skillsProficiency || [],
      domainDistribution: dashboard.analytics?.domainDistribution || [],
    };
  },

  async getStudentCertificates() {
    try {
      const response = await apiRequest('/realtime/certificates/my');
      const certificates = Array.isArray(response.data) ? response.data : [];
      return await Promise.all(certificates.map(async (certificate) => {
        const verificationResponse = await apiRequest(`/realtime/certificates/verify/${encodeURIComponent(certificate.certificateId)}`)
          .catch(() => null);
        const verification = verificationResponse?.data || {};
        const snapshot = certificate.dataSnapshot || {};
        const company = snapshot.companyName || 'Company';
        const verified = verification.valid === true;
        return {
          id: certificate.certificateId,
          verificationUrl: certificate.verificationUrl,
          title: snapshot.internshipTitle || 'Internship Completion',
          company,
          companyLogo: company.charAt(0).toUpperCase(),
          studentName: snapshot.studentName || '',
          status: verified ? 'Verified' : certificate.status === 'REVOKED' ? 'Revoked' : 'Verification unavailable',
          statusVariant: verified ? 'success' : 'warning',
          description: `Completion credential issued by ${company}.`,
          issueDate: certificate.issued_date
            ? new Date(certificate.issued_date).toLocaleDateString()
            : 'Not specified',
          duration: snapshot.startDate && snapshot.endDate
            ? `${Math.max(1, Math.round((new Date(snapshot.endDate) - new Date(snapshot.startDate)) / (30 * 24 * 60 * 60 * 1000)))} months`
            : 'Not specified',
          grade: verified ? 'Verified' : 'Pending',
          issuer: company,
          skills: [],
        };
      }));
    } catch {
      return [];
    }
  },

  async downloadSignedCertificate(certificateId) {
    const response = await fetch(`${API_BASE_URL}/realtime/certificates/${encodeURIComponent(certificateId)}/download`, {
      headers: { Authorization: `Bearer ${getAuthToken() || ''}` },
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.message || 'Unable to download certificate.');
    }
    const objectUrl = window.URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `${certificateId}.pdf`;
    link.click();
    window.URL.revokeObjectURL(objectUrl);
  },

  async getStudentDashboardData() {
    const studentId = getStudentId();
    const localUser = readStoredValue('internpulse_user', {});

    const [profileRes, intelligenceRes, applicationsRes, certificatesRes] = await Promise.allSettled([
      apiRequest('/students/profile'),
      apiRequest(`/intelligence/dashboard/${encodeURIComponent(studentId)}`),
      apiRequest('/applications/my'),
      apiRequest('/certificates/my'),
    ]);

    const profile = createDashboardProfile(
      profileRes.status === 'fulfilled' ? profileRes.value?.profile : null,
      localUser,
      studentId,
    );

    const intelligence = intelligenceRes.status === 'fulfilled' && intelligenceRes.value
      ? intelligenceRes.value
      : {};

    const applications = Array.isArray(applicationsRes.status === 'fulfilled' ? applicationsRes.value?.applications : null)
      ? applicationsRes.value.applications
      : [];
    const certificates = certificatesRes.status === 'fulfilled' ? (Array.isArray(certificatesRes.value?.certificates) ? certificatesRes.value.certificates : []) : [];
    const verifiedCertificates = certificates.filter((certificate) => certificate.verified).length;
    const demoProgress = readStoredValue('internpulse_demo_progress', {});

    const completed = applications.filter((application) => application.status === 'COMPLETED');
    const active = applications.find((application) => application.status === 'ONGOING') || applications.find((application) => application.status === 'SELECTED');
    const activeTracking = active
      ? { ...(demoProgress[String(active.internship_id)] || {}), ...(active.demo_tracking || {}) }
      : {};

    const normalizedApplications = applications.map((application) => ({
      ...application,
      role: application.title || 'Internship',
      company: application.company_name || 'Company',
      type: application.mode || 'Internship',
      location: application.location || 'Not specified',
      stipend: application.stipend ? `₹${application.stipend}/month` : 'Not specified',
      appliedDate: application.applied_at ? new Date(application.applied_at).toLocaleDateString() : 'Unknown',
      status: application.status || 'APPLIED',
      statusVariant: application.status === 'REJECTED' ? 'danger' : application.status === 'SELECTED' ? 'success' : 'warning',
    }));

    const stats = {
      ...emptyDashboard.stats,
      totalApplications: applications.length,
      applicationsTrend: applications.length ? `${applications.length} submitted applications` : 'No application history yet',
      shortlistedApplications: applications.filter((application) => application.status === 'SELECTED').length,
      shortlistedRate: applications.length ? `${Math.round((applications.filter((application) => application.status === 'SELECTED').length / applications.length) * 100)}% shortlist rate` : '0% shortlist rate',
      activeInternshipCount: applications.filter((application) => application.status === 'ONGOING').length,
      activeInternshipCompany: active?.company_name || emptyDashboard.stats.activeInternshipCompany,
      completedInternships: completed.length,
      completedCertificates: `${verifiedCertificates} verified certificate${verifiedCertificates === 1 ? '' : 's'}`,
    };

    const statusLabels = {
      APPLIED: ['Pending Review', '#e1a44b'],
      SELECTED: ['Shortlisted', '#397695'],
      ONGOING: ['Active Internship', '#245c84'],
      COMPLETED: ['Completed', '#617d70'],
      REJECTED: ['Not Selected', '#b65b3c'],
    };
    const statusCounts = new Map();
    const monthCounts = new Map();
    const domainCounts = new Map();
    applications.forEach((application) => {
      const status = application.status || 'APPLIED';
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
      const appliedDate = application.applied_at ? new Date(application.applied_at) : new Date();
      const monthKey = `${appliedDate.getFullYear()}-${String(appliedDate.getMonth() + 1).padStart(2, '0')}`;
      const month = appliedDate.toLocaleString('en', { month: 'short' });
      const monthRecord = monthCounts.get(monthKey) || { month, applications: 0, shortlisted: 0, interviews: 0 };
      monthRecord.applications += 1;
      if (status === 'SELECTED') monthRecord.shortlisted += 1;
      monthCounts.set(monthKey, monthRecord);
      const title = String(application.title || 'Other').toLowerCase();
      const domain = title.includes('machine') || title.includes('ai') ? 'AI & Machine Learning'
        : title.includes('data') ? 'Data Analytics'
          : title.includes('frontend') ? 'Frontend Engineering' : 'Software Engineering';
      domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
    });

    const localSkills = readStoredValue('internpulse_profile_skill_levels', {});
    const skillScores = { Beginner: 35, Intermediate: 65, Advanced: 90 };
    const trackedApplicationIds = new Set();
    const allTracking = applications.flatMap((application) => {
      if (!application.demo_tracking) return [];
      trackedApplicationIds.add(String(application.internship_id));
      return [application.demo_tracking];
    });
    allTracking.push(...Object.entries(demoProgress)
      .filter(([internshipId]) => !trackedApplicationIds.has(String(internshipId)))
      .map(([, tracking]) => tracking));
    const totalHoursLogged = allTracking.reduce((sum, tracking) => sum + Number(tracking.hours || 0), 0);
    const requiredHours = allTracking.reduce((sum, tracking) => sum + Number(tracking.totalHours || 0), 0);
    const applicationsOverTime = [...monthCounts.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([, value]) => value);
    const statusDistribution = [...statusCounts.entries()].map(([status, value]) => ({
      name: statusLabels[status]?.[0] || status,
      value,
      color: statusLabels[status]?.[1] || '#7c8a95',
    }));
    const domainDistribution = [...domainCounts.entries()].map(([domain, count]) => ({
      domain,
      applications: count,
      percentage: applications.length ? Math.round((count / applications.length) * 100) : 0,
    }));
    const safeProfileSkills = Array.isArray(profile?.skills) ? profile.skills : [];
    const analytics = {
      summary: {
        ...emptyDashboard.analytics.summary,
        totalApplications: applications.length,
        applicationsTrend: applications.length ? `${applications.length} submitted applications` : 'No application history yet',
        shortlisted: statusCounts.get('SELECTED') || 0,
        shortlistedTrend: applications.length ? `${Math.round(((statusCounts.get('SELECTED') || 0) / applications.length) * 100)}% shortlist rate` : '0% shortlist rate',
        pending: statusCounts.get('APPLIED') || 0,
        pendingTrend: 'Awaiting recruiter feedback',
        rejected: statusCounts.get('REJECTED') || 0,
        rejectedTrend: 'Applications not selected',
        offers: statusCounts.get('SELECTED') || 0,
        totalHoursLogged,
        requiredHours,
        hoursCompletionPercent: requiredHours ? Math.round((totalHoursLogged / requiredHours) * 100) : 0,
      },
      applicationsOverTime,
      statusDistribution,
      weeklyHoursProgress: Array.isArray(activeTracking.weeklyHoursProgress) ? activeTracking.weeklyHoursProgress : [],
      skillsProficiency: safeProfileSkills.map((skill) => ({
        skill,
        studentScore: skillScores[localSkills[skill] || 'Intermediate'],
        benchmark: 60,
      })),
      domainDistribution,
    };
    const normalizedDeadlines = Array.isArray(intelligence.deadlines) && intelligence.deadlines.length
      ? intelligence.deadlines
      : Array.isArray(activeTracking.deadlines)
        ? activeTracking.deadlines
        : readStoredValue('internpulse_demo_deadlines', []);

    const normalizedRecommendations = Array.isArray(intelligence.recommendations?.recommendations)
      ? intelligence.recommendations.recommendations
      : [];

    return {
      profile,
      stats,
      activeInternship: active ? {
        ...emptyDashboard.activeInternship,
        company: active.company_name || 'Active Internship',
        companyLogo: active.company_name?.charAt(0).toUpperCase() || '?',
        role: active.title || 'Intern',
        department: activeTracking.department || 'Internship cohort',
        location: active.location || 'Location not specified',
        stipend: active.stipend ? `₹${Number(active.stipend).toLocaleString('en-IN')} / month` : 'Not specified',
        currentWeek: activeTracking.currentWeek || 0,
        totalDurationWeeks: activeTracking.totalDurationWeeks || 0,
        progressPercentage: activeTracking.progress || 0,
        totalHoursCompleted: activeTracking.hours || 0,
        totalHoursRequired: activeTracking.totalHours || 0,
        mentorName: activeTracking.mentor || 'Not assigned',
        mentorRole: activeTracking.mentorRole || '',
        milestones: Array.isArray(activeTracking.milestones) ? activeTracking.milestones : [],
      } : emptyDashboard.activeInternship,
      deadlines: normalizedDeadlines,
      recentApplications: normalizedApplications,
      recommendedInternships: normalizedRecommendations.map((recommendation) => {
        const rawMatchScore = recommendation.matchScore ?? recommendation.score ?? 0;
        const numericMatchScore = typeof rawMatchScore === 'number'
          ? rawMatchScore
          : Number(String(rawMatchScore).replace(/%/, '').trim()) || 0;
        const normalizedMatchScore = numericMatchScore > 1 ? numericMatchScore : Math.round(numericMatchScore * 100);
        const skills = Array.isArray(recommendation.skills)
          ? recommendation.skills
          : Array.isArray(recommendation.required_skills)
            ? recommendation.required_skills
            : Array.isArray(recommendation.matchedSkills)
              ? recommendation.matchedSkills
              : Array.isArray(recommendation.matched_skills)
                ? recommendation.matched_skills
                : [];

        return {
          ...recommendation,
          matchScore: normalizedMatchScore,
          skills,
          matchedSkills: recommendation.matchedSkills || recommendation.matched_skills || skills,
        };
      }),
      analytics: { ...analytics, ...(intelligence.analytics || {}) },
    };
  },
};

export default studentService;
