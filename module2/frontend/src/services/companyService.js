import apiRequest from './api';

const stageLabels = {
  NEW: 'New',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interview',
  REJECTED: 'Rejected',
};

function splitSkills(value) {
  return (Array.isArray(value) ? value : String(value || '').split(','))
    .map((skill) => String(skill).trim())
    .filter(Boolean);
}

function formatDate(value) {
  return value
    ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Not specified';
}

function mapInternship(internship) {
  const stipend = Number(internship.stipend || 0);
  return {
    ...internship,
    department: internship.department || 'Engineering',
    type: internship.internship_type || 'Full-time',
    location: internship.location || 'Not specified',
    stipendAmount: stipend,
    stipend: stipend ? `₹${stipend.toLocaleString('en-IN')} / month` : 'Not specified',
    duration: internship.duration_months ? `${internship.duration_months} Months` : 'Not specified',
    applicants: Number(internship.applicant_count || 0),
    status: internship.status === 'CLOSED' ? 'Closed' : 'Published',
  };
}

function mapApplication(application) {
  const skills = splitSkills(application.skills);
  const requiredSkills = splitSkills(application.skills_required);
  const matchedSkills = requiredSkills.filter((skill) => (
    skills.some((candidateSkill) => candidateSkill.toLowerCase() === skill.toLowerCase())
  ));
  const match = requiredSkills.length
    ? Math.round(55 + (matchedSkills.length / requiredSkills.length) * 45)
    : 76;
  const status = application.status === 'ONGOING'
    ? 'Active'
    : application.status === 'COMPLETED'
      ? 'Completed'
      : stageLabels[application.pipeline_stage] || (application.status === 'SELECTED' ? 'Shortlisted' : 'New');

  return {
    ...application,
    name: application.name || 'Student applicant',
    role: application.title || 'Internship',
    skills: skills.join(', ') || 'Skills not provided',
    match,
    applied: formatDate(application.applied_at),
    status,
    progressData: application.progress_data || {},
  };
}

function toApiInternship(data) {
  const stipend = String(data.stipend || '').replace(/[^\d.]/g, '');
  const duration = Number.parseInt(String(data.duration || '').replace(/\D/g, ''), 10);
  const status = data.status === 'Closed' || data.status === 'Archived'
    ? 'CLOSED'
    : data.status === 'Draft' ? 'DRAFT' : 'POSTED';
  return {
    title: data.title,
    description: data.description || '',
    skills_required: data.requiredSkills || data.skills_required || '',
    department: data.department || '',
    ...((data.type || data.internship_type) && { internship_type: data.type || data.internship_type }),
    eligibility: data.eligibility || '',
    location: data.location || '',
    stipend: stipend ? Number(stipend) : null,
    duration_months: duration || null,
    status,
  };
}

const companyService = {
  async getProfile() {
    const response = await apiRequest('/companies/profile');
    return response.profile;
  },

  async getInternships() {
    const response = await apiRequest('/internships/company/my');
    return (response.internships || []).map(mapInternship);
  },

  async getApplications() {
    const response = await apiRequest('/applications/company/my');
    return (response.applications || []).map(mapApplication);
  },

  async createInternship(data) {
    return apiRequest('/internships', {
      method: 'POST',
      body: JSON.stringify(toApiInternship(data)),
    });
  },

  async updateInternship(id, data) {
    return apiRequest(`/internships/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toApiInternship(data)),
    });
  },

  async updateApplicationStatus(id, status) {
    const statusByLabel = {
      New: 'APPLIED',
      Shortlisted: 'SELECTED',
      Interview: 'INTERVIEW',
      Active: 'ONGOING',
      Completed: 'COMPLETED',
      Rejected: 'REJECTED',
    };
    return apiRequest(`/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: statusByLabel[status] || status }),
    });
  },

  async updateProgress(id, data) {
    const response = await apiRequest(`/applications/${id}/progress`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.progress;
  },

  async issueCertificate(applicationId) {
    return apiRequest('/realtime/certificates', {
      method: 'POST',
      body: JSON.stringify({ applicationId }),
    });
  },

  mapInternship,
  mapApplication,
};

export default companyService;