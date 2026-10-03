import apiRequest from './api';

function formatMonth(value) {
  return value.toLocaleString('en', { month: 'short' });
}

function normalizeStudent(student) {
  const status = student.application_status || 'Unassigned';
  const progressData = student.progress_data || {};
  const progress = Number(progressData.progress ?? (status === 'COMPLETED' ? 100 : 0));
  const activeInternships = Number(student.active_internships ?? (status === 'ONGOING' ? 1 : 0));
  const completedInternships = Number(student.completed_internships ?? (status === 'COMPLETED' ? 1 : 0));
  return {
    ...student,
    application_status: status,
    progress_data: progressData,
    progress,
    active_internships: activeInternships,
    completed_internships: completedInternships,
    company_partners: student.company_partners || [],
    placed: activeInternships > 0 || completedInternships > 0,
  };
}

async function getOverview() {
  const [profileResponse, rosterResponse] = await Promise.all([
    apiRequest('/institutions/profile'),
    apiRequest('/institutions/students'),
  ]);
  const students = (rosterResponse.students || []).map(normalizeStudent);
  const active = students.filter((student) => student.application_status === 'ONGOING');
  const completed = students.filter((student) => student.completed_internships > 0);
  const placed = students.filter((student) => student.placed);
  const partners = [...new Set(students.flatMap((student) => [
    ...(student.company_partners || []),
    student.company_name,
  ]).filter(Boolean))];
  const departmentMap = new Map();
  const statusCounts = new Map();
  const evaluationCounts = new Map([['Excellent', 0], ['Good', 0], ['Needs Review', 0]]);
  const monthMap = new Map();

  for (let monthOffset = 5; monthOffset >= 0; monthOffset -= 1) {
    const monthDate = new Date();
    monthDate.setDate(1);
    monthDate.setMonth(monthDate.getMonth() - monthOffset);
    const key = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
    monthMap.set(key, { month: formatMonth(monthDate), applications: 0, placed: 0 });
  }

  for (const student of students) {
    const department = student.branch || student.course || 'Unspecified';
    const departmentRecord = departmentMap.get(department) || { department, students: 0, internships: 0, completionTotal: 0 };
    departmentRecord.students += 1;
    departmentRecord.internships += student.placed ? 1 : 0;
    departmentRecord.completionTotal += student.progress;
    departmentMap.set(department, departmentRecord);

    statusCounts.set(student.application_status, (statusCounts.get(student.application_status) || 0) + 1);
    if (evaluationCounts.has(student.progress_data.evaluation)) {
      evaluationCounts.set(student.progress_data.evaluation, evaluationCounts.get(student.progress_data.evaluation) + 1);
    }

    if (student.applied_at) {
      const appliedDate = new Date(student.applied_at);
      const key = `${appliedDate.getFullYear()}-${String(appliedDate.getMonth() + 1).padStart(2, '0')}`;
      const monthRecord = monthMap.get(key);
      if (monthRecord) {
        monthRecord.applications += 1;
        if (student.placed) monthRecord.placed += 1;
      }
    }
  }

  const departments = [...departmentMap.values()].map((department) => ({
    ...department,
    completion: department.students ? Math.round(department.completionTotal / department.students) : 0,
  })).sort((left, right) => right.students - left.students);
  const internshipStatus = [
    { name: 'Active', value: statusCounts.get('ONGOING') || 0, color: '#0f3c65' },
    { name: 'Completed', value: statusCounts.get('COMPLETED') || 0, color: '#245c84' },
    { name: 'Selected', value: statusCounts.get('SELECTED') || 0, color: '#d18b49' },
    { name: 'Applied', value: statusCounts.get('APPLIED') || 0, color: '#91a5b8' },
    { name: 'Unassigned', value: statusCounts.get('Unassigned') || 0, color: '#d9c987' },
  ].filter((item) => item.value > 0);

  const activities = [
    ...active.slice(0, 2).map((student) => ({ title: `${student.name} is active at ${student.company_name || 'an industry partner'}`, time: 'Active internship' })),
    ...students.filter((student) => student.application_status === 'APPLIED').slice(0, 1).map((student) => ({ title: `${student.name} has an application awaiting review`, time: student.applied_at ? new Date(student.applied_at).toLocaleDateString() : 'Application received' })),
    ...completed.slice(0, 1).map((student) => ({ title: `${student.name} completed ${student.internship_title || 'an internship'}`, time: 'Placement completed' })),
  ];

  return {
    institution: profileResponse.profile,
    students,
    departments,
    summary: {
      totalStudents: students.length,
      activeInternships: students.reduce((total, student) => total + student.active_internships, 0),
      studentsPlaced: placed.length,
      industryPartners: partners.length,
      completedInternships: students.reduce((total, student) => total + student.completed_internships, 0),
      reportsSubmitted: students.reduce((total, student) => total + Number(student.progress_data.reports || 0), 0),
      pendingReviews: students.filter((student) => student.progress_data.status === 'Attention').length,
      placementRate: students.length ? Math.round((placed.length / students.length) * 100) : 0,
      completionRate: active.length + students.reduce((total, student) => total + student.completed_internships, 0)
        ? Math.round((students.reduce((total, student) => total + student.completed_internships, 0) / (active.length + students.reduce((total, student) => total + student.completed_internships, 0))) * 100)
        : 0,
      employerSatisfaction: evaluationCounts.size
        ? Math.round(((evaluationCounts.get('Excellent') * 95) + (evaluationCounts.get('Good') * 80) + (evaluationCounts.get('Needs Review') * 60)) / Math.max(1, [...evaluationCounts.values()].reduce((sum, value) => sum + value, 0)))
        : 0,
    },
    monthlyApplications: [...monthMap.values()],
    internshipStatus,
    evaluations: [...evaluationCounts.entries()].map(([category, count]) => ({ category, count })),
    activities: activities.length ? activities : [{ title: 'Student roster is ready for monitoring', time: 'Current cohort' }],
  };
}

export default { getOverview };
