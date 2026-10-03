const pool = require('../config/db');

const demoPasswordHash = '$2b$10$ffzjMiAz/APt0Y79hU9FY.ayMdnB00uO23VwuyeXkR7ispNtpfq96';

async function seedDemoPortal() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES
         ('Alex Morgan', 'student@internpulse.com', $1, 'STUDENT'),
         ('TechNova Recruiter', 'company@technova.com', $1, 'COMPANY'),
         ('Dean of Placements', 'institution@apex.edu', $1, 'INSTITUTION'),
         ('Platform Administrator', 'admin@internpulse.com', $1, 'ADMIN'),
         ('Northstar Hiring', 'careers@northstar.example', $1, 'COMPANY'),
         ('Greenfield Talent', 'talent@greenfield.example', $1, 'COMPANY'),
         ('Orbit Labs Hiring', 'jobs@orbitlabs.example', $1, 'COMPANY')
       ON CONFLICT (email) DO NOTHING`,
      [demoPasswordHash],
    );

    await client.query(`
      CREATE TABLE IF NOT EXISTS organization_registration_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        requested_role VARCHAR(20) NOT NULL CHECK (requested_role IN ('COMPANY', 'INSTITUTION')),
        organization_name VARCHAR(150) NOT NULL,
        details JSONB NOT NULL DEFAULT '{}'::JSONB,
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMPTZ,
        reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        review_note TEXT
      )
    `);

    await client.query(
      `INSERT INTO students (user_id, college_name, course, branch, year, skills, phone)
       SELECT id, 'Apex Institute of Technology', 'B.Tech', 'Computer Science & AI', 4,
              'Python, Machine Learning, React, SQL, FastAPI, Git, Docker', '+91 98765 43210'
       FROM users WHERE email = 'student@internpulse.com'
       ON CONFLICT (user_id) DO UPDATE SET
         college_name = COALESCE(NULLIF(students.college_name, ''), EXCLUDED.college_name),
         course = COALESCE(NULLIF(students.course, ''), EXCLUDED.course),
         branch = COALESCE(NULLIF(students.branch, ''), EXCLUDED.branch),
         year = COALESCE(students.year, EXCLUDED.year),
         skills = COALESCE(NULLIF(students.skills, ''), EXCLUDED.skills),
         phone = COALESCE(NULLIF(students.phone, ''), EXCLUDED.phone)`,
    );

    await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES
         ('Aarav Patil', 'aarav.patil@example.com', $1, 'STUDENT'),
         ('Priya Sharma', 'priya.sharma@example.com', $1, 'STUDENT'),
         ('Rohan Deshmukh', 'rohan.deshmukh@example.com', $1, 'STUDENT'),
         ('Sneha Kulkarni', 'sneha.kulkarni@example.com', $1, 'STUDENT'),
         ('Aditya Joshi', 'aditya.joshi@example.com', $1, 'STUDENT'),
         ('Meera Iyer', 'meera.iyer@example.com', $1, 'STUDENT')
       ON CONFLICT (email) DO NOTHING`,
      [demoPasswordHash],
    );

    await client.query(
      `INSERT INTO students (user_id, college_name, course, branch, year, skills, phone)
       SELECT users.id, demo.college, 'B.Tech', demo.branch, demo.year, demo.skills, demo.phone
       FROM (VALUES
         ('aarav.patil@example.com', 'Apex Institute of Technology', 'Computer Science & AI', 4, 'Python, Machine Learning, PyTorch, SQL, Git', '+91 98765 10001'),
         ('priya.sharma@example.com', 'Apex Institute of Technology', 'Computer Science', 4, 'React, JavaScript, CSS, TypeScript, Git', '+91 98765 10002'),
         ('rohan.deshmukh@example.com', 'Apex Institute of Technology', 'Data Science', 3, 'Python, SQL, Power BI, Statistics, Excel', '+91 98765 10003'),
         ('sneha.kulkarni@example.com', 'Apex Institute of Technology', 'Artificial Intelligence', 4, 'Python, NLP, Deep Learning, FastAPI, SQL', '+91 98765 10004'),
         ('aditya.joshi@example.com', 'Apex Institute of Technology', 'Computer Science', 3, 'Node.js, Express, PostgreSQL, REST APIs, Docker', '+91 98765 10005'),
         ('meera.iyer@example.com', 'Apex Institute of Technology', 'Computer Science', 4, 'AWS, Docker, Linux, CI/CD, Python', '+91 98765 10006')
       ) AS demo(email, college, branch, year, skills, phone)
       JOIN users ON users.email = demo.email
       ON CONFLICT (user_id) DO UPDATE SET
         college_name = COALESCE(NULLIF(students.college_name, ''), EXCLUDED.college_name),
         branch = COALESCE(NULLIF(students.branch, ''), EXCLUDED.branch),
         year = COALESCE(students.year, EXCLUDED.year),
         skills = COALESCE(NULLIF(students.skills, ''), EXCLUDED.skills),
         phone = COALESCE(NULLIF(students.phone, ''), EXCLUDED.phone)`,
    );

    await client.query(
      `INSERT INTO companies (user_id, company_name, industry, website, location, description)
       SELECT id, company_name, industry, website, location, description
       FROM users
       JOIN (VALUES
         ('company@technova.com', 'TechNova Solutions', 'Information Technology & AI', 'https://technova.example.com', 'Pune / Hybrid', 'Enterprise AI and cloud products built with early-career engineers.'),
         ('careers@northstar.example', 'Northstar Analytics', 'Data & Analytics', 'https://northstar.example', 'Mumbai / Hybrid', 'A product analytics team helping organizations make better decisions.'),
         ('talent@greenfield.example', 'Greenfield Mobility', 'Climate Technology', 'https://greenfield.example', 'Remote', 'Software and data tools for cleaner, more accessible transport.'),
         ('jobs@orbitlabs.example', 'Orbit Labs', 'Developer Tools', 'https://orbitlabs.example', 'Bengaluru / Hybrid', 'A small engineering studio building reliable developer platforms.')
       ) AS demo(email, company_name, industry, website, location, description) USING (email)
       ON CONFLICT (user_id) DO NOTHING`,
    );

    await client.query(
      `INSERT INTO institutions (user_id, institution_name, address, contact_number)
       SELECT id, 'Apex Institute of Technology', 'Knowledge Park, Sector 62, Innovation Corridor', '+91 11 2345 6789'
       FROM users WHERE email = 'institution@apex.edu'
       ON CONFLICT (user_id) DO NOTHING`,
    );

    await client.query(
      `INSERT INTO student_institution_memberships (student_user_id, institution_id, assigned_by)
       SELECT student_user.id, institution.id, institution.user_id
       FROM users student_user
       JOIN students ON students.user_id = student_user.id
       JOIN users institution_user ON institution_user.email = 'institution@apex.edu'
       JOIN institutions institution ON institution.user_id = institution_user.id
       WHERE student_user.email IN (
         'student@internpulse.com',
         'aarav.patil@example.com',
         'priya.sharma@example.com',
         'rohan.deshmukh@example.com',
         'sneha.kulkarni@example.com',
         'aditya.joshi@example.com',
         'meera.iyer@example.com'
       )
       ON CONFLICT (student_user_id) DO NOTHING`,
    );

    await client.query(`
      CREATE TABLE IF NOT EXISTS company_internship_details (
        internship_id INTEGER PRIMARY KEY REFERENCES internships(id) ON DELETE CASCADE,
        department VARCHAR(100),
        internship_type VARCHAR(30) NOT NULL DEFAULT 'Full-time',
        eligibility TEXT
      );
      CREATE TABLE IF NOT EXISTS company_application_pipeline (
        application_id INTEGER PRIMARY KEY REFERENCES applications(id) ON DELETE CASCADE,
        stage VARCHAR(20) NOT NULL CHECK (stage IN ('NEW', 'SHORTLISTED', 'INTERVIEW', 'REJECTED')),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(
      `WITH demo_internships(email, title, description, skills_required, location, stipend, duration_months, status) AS (
         VALUES
           ('careers@northstar.example', 'Product Data Analyst Intern', 'Explore product usage, build clear dashboards, and turn customer questions into measurable insights.', 'SQL, Python, Tableau, Statistics', 'Mumbai / Hybrid', 18000, 4, 'POSTED'),
           ('careers@northstar.example', 'Applied AI Research Intern', 'Prototype retrieval and classification workflows and evaluate them with real product data.', 'Python, Machine Learning, NLP, FastAPI', 'Remote', 24000, 6, 'POSTED'),
           ('talent@greenfield.example', 'Frontend Engineer Intern', 'Ship accessible React experiences for a suite of public transit planning tools.', 'React, JavaScript, CSS, Accessibility', 'Remote', 16000, 4, 'POSTED'),
           ('talent@greenfield.example', 'Data Engineering Intern', 'Build tested ingestion jobs and monitor data quality across mobility datasets.', 'Python, SQL, PostgreSQL, Docker', 'Pune / Hybrid', 20000, 5, 'POSTED'),
           ('jobs@orbitlabs.example', 'Developer Experience Intern', 'Improve internal tools, examples, and onboarding flows for a growing developer platform.', 'TypeScript, React, Node.js, Git', 'Bengaluru / Hybrid', 22000, 5, 'POSTED'),
           ('jobs@orbitlabs.example', 'Cloud Platform Intern', 'Help automate deployment workflows and improve service observability.', 'Docker, Linux, CI/CD, AWS', 'Bengaluru / Hybrid', 23000, 6, 'POSTED'),
           ('company@technova.com', 'Backend Engineering Intern', 'Design and implement API features with careful tests, documentation, and production monitoring.', 'Node.js, Express, PostgreSQL, REST API', 'Pune / Hybrid', 21000, 5, 'POSTED'),
           ('company@technova.com', 'UX Research & Design Intern', 'Work with product and engineering to make complex workflows clear and accessible.', 'Figma, User Research, Prototyping, Accessibility', 'Remote', 15000, 3, 'POSTED')
       )
       INSERT INTO internships (company_id, title, description, skills_required, location, stipend, duration_months, start_date, end_date, status)
       SELECT companies.id, demo.title, demo.description, demo.skills_required, demo.location,
              demo.stipend, demo.duration_months, CURRENT_DATE + INTERVAL '30 days',
              CURRENT_DATE + (demo.duration_months || ' months')::INTERVAL, demo.status
       FROM demo_internships demo
       JOIN users ON users.email = demo.email
       JOIN companies ON companies.user_id = users.id
       WHERE NOT EXISTS (
         SELECT 1 FROM internships existing
         WHERE existing.company_id = companies.id AND existing.title = demo.title
       )`,
    );

    await client.query(
      `WITH demo_roles(email, title, description, skills_required, department, internship_type, eligibility, location, stipend, duration_months) AS (
         VALUES
           ('company@technova.com', 'Machine Learning Engineer Intern', 'Build and evaluate supervised learning models, data pipelines, and model APIs with a mentor.', 'Python, SQL, Machine Learning, scikit-learn, Git', 'AI / ML', 'Full-time', 'B.Tech in Computer Science, AI, or a related field', 'Pune / Hybrid', 25000, 6),
           ('company@technova.com', 'Frontend Developer Intern', 'Build accessible product interfaces and reusable components alongside the design systems team.', 'React, JavaScript, CSS, TypeScript, Git', 'Engineering', 'Full-time', 'B.Tech in Computer Science or a related field', 'Remote', 20000, 4),
           ('company@technova.com', 'Data Analytics Intern', 'Prepare trusted datasets, build dashboards, and explain product trends to business partners.', 'Python, SQL, Power BI, Statistics, Excel', 'Analytics', 'Full-time', 'B.Tech in Data Science, Statistics, or a related field', 'Mumbai / Hybrid', 22000, 5),
           ('company@technova.com', 'AI Research Intern', 'Prototype NLP workflows and evaluate model quality against a real-world dataset.', 'Python, NLP, Deep Learning, FastAPI, SQL', 'AI Research', 'Full-time', 'B.Tech in AI, Computer Science, or a related field', 'Pune / Hybrid', 24000, 6),
           ('company@technova.com', 'Backend Engineering Intern', 'Design API features, write integration tests, and improve service observability.', 'Node.js, Express, PostgreSQL, REST APIs, Docker', 'Engineering', 'Full-time', 'B.Tech in Computer Science or a related field', 'Pune / Hybrid', 21000, 5),
           ('company@technova.com', 'Cloud & DevOps Intern', 'Improve build pipelines and deployment reliability for containerized services.', 'AWS, Docker, Linux, CI/CD, Python', 'Cloud Platform', 'Hybrid', 'B.Tech in Computer Science or Information Technology', 'Bengaluru / Hybrid', 23000, 6)
       )
      INSERT INTO internships (company_id, title, description, skills_required, location, stipend, duration_months, start_date, end_date, status)
      SELECT companies.id, demo.title, demo.description, demo.skills_required, demo.location, demo.stipend, demo.duration_months,
              CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + (demo.duration_months || ' months')::INTERVAL,
              'POSTED'
       FROM demo_roles demo
       JOIN users ON users.email = demo.email
       JOIN companies ON companies.user_id = users.id
       WHERE NOT EXISTS (
         SELECT 1 FROM internships existing
         WHERE existing.company_id = companies.id AND existing.title = demo.title
       )`,
    );

    await client.query(
      `INSERT INTO company_internship_details (internship_id, department, internship_type, eligibility)
       SELECT i.id, demo.department, demo.internship_type, demo.eligibility
       FROM (VALUES
         ('Machine Learning Engineer Intern', 'AI / ML', 'Full-time', 'B.Tech in Computer Science, AI, or a related field'),
         ('Frontend Developer Intern', 'Engineering', 'Full-time', 'B.Tech in Computer Science or a related field'),
         ('Data Analytics Intern', 'Analytics', 'Full-time', 'B.Tech in Data Science, Statistics, or a related field'),
         ('AI Research Intern', 'AI Research', 'Full-time', 'B.Tech in AI, Computer Science, or a related field'),
         ('Backend Engineering Intern', 'Engineering', 'Full-time', 'B.Tech in Computer Science or a related field'),
         ('Cloud & DevOps Intern', 'Cloud Platform', 'Hybrid', 'B.Tech in Computer Science or Information Technology')
       ) AS demo(title, department, internship_type, eligibility)
       JOIN internships i ON i.title = demo.title
       JOIN companies ON companies.id = i.company_id AND companies.company_name = 'TechNova Solutions'
       ON CONFLICT (internship_id) DO NOTHING`,
    );

    await client.query(
      `INSERT INTO applications (internship_id, student_id, status, applied_at)
       SELECT internships.id, students.id, demo.status, CURRENT_DATE - (demo.days_ago || ' days')::INTERVAL
       FROM (VALUES
         ('Product Data Analyst Intern', 'SELECTED', 19),
         ('Frontend Engineer Intern', 'APPLIED', 12),
         ('Developer Experience Intern', 'REJECTED', 34),
         ('Backend Engineering Intern', 'APPLIED', 6)
       ) AS demo(title, status, days_ago)
       JOIN internships ON internships.title = demo.title
       JOIN companies ON companies.id = internships.company_id
       JOIN users company_user ON company_user.id = companies.user_id
       JOIN students ON students.user_id = (SELECT id FROM users WHERE email = 'student@internpulse.com')
       WHERE (company_user.email, internships.title) IN (
         ('careers@northstar.example', 'Product Data Analyst Intern'),
         ('talent@greenfield.example', 'Frontend Engineer Intern'),
         ('jobs@orbitlabs.example', 'Developer Experience Intern'),
         ('company@technova.com', 'Backend Engineering Intern')
       )
       ON CONFLICT (internship_id, student_id) DO NOTHING`,
    );

    await client.query(
      `INSERT INTO applications (internship_id, student_id, status, applied_at)
       SELECT internships.id, students.id, demo.status,
              CURRENT_DATE - (demo.days_ago || ' days')::INTERVAL
       FROM (VALUES
         ('aarav.patil@example.com', 'Machine Learning Engineer Intern', 'ONGOING', 28),
         ('priya.sharma@example.com', 'Frontend Developer Intern', 'SELECTED', 11),
         ('rohan.deshmukh@example.com', 'Data Analytics Intern', 'SELECTED', 9),
         ('sneha.kulkarni@example.com', 'AI Research Intern', 'ONGOING', 22),
         ('aditya.joshi@example.com', 'Backend Engineering Intern', 'APPLIED', 5),
         ('meera.iyer@example.com', 'Cloud & DevOps Intern', 'APPLIED', 3)
       ) AS demo(student_email, title, status, days_ago)
       JOIN users student_user ON student_user.email = demo.student_email
       JOIN students ON students.user_id = student_user.id
       JOIN internships ON internships.title = demo.title
       JOIN companies ON companies.id = internships.company_id
       JOIN users company_user ON company_user.id = companies.user_id
       WHERE company_user.email = 'company@technova.com'
       ON CONFLICT (internship_id, student_id) DO NOTHING`,
    );

    await client.query(
      `INSERT INTO company_application_pipeline (application_id, stage)
       SELECT applications.id, demo.stage
       FROM (VALUES
         ('aarav.patil@example.com', 'Machine Learning Engineer Intern', 'SHORTLISTED'),
         ('priya.sharma@example.com', 'Frontend Developer Intern', 'INTERVIEW'),
         ('rohan.deshmukh@example.com', 'Data Analytics Intern', 'SHORTLISTED'),
         ('aditya.joshi@example.com', 'Backend Engineering Intern', 'NEW'),
         ('meera.iyer@example.com', 'Cloud & DevOps Intern', 'NEW')
       ) AS demo(student_email, title, stage)
       JOIN users student_user ON student_user.email = demo.student_email
       JOIN students ON students.user_id = student_user.id
       JOIN applications ON applications.student_id = students.id
       JOIN internships ON internships.id = applications.internship_id AND internships.title = demo.title
       JOIN companies ON companies.id = internships.company_id AND companies.company_name = 'TechNova Solutions'
       ON CONFLICT (application_id) DO NOTHING`,
    );

    await client.query(
      `CREATE TABLE IF NOT EXISTS student_internship_progress (
         application_id INTEGER PRIMARY KEY REFERENCES applications(id) ON DELETE CASCADE,
         progress_data JSONB NOT NULL DEFAULT '{}'::JSONB,
         updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
       )`,
    );

    await client.query(
      `INSERT INTO student_internship_progress (application_id, progress_data)
       SELECT applications.id, $1::JSONB
       FROM applications
       JOIN internships ON internships.id = applications.internship_id
       JOIN students ON students.id = applications.student_id
       JOIN users ON users.id = students.user_id
       WHERE users.email = 'student@internpulse.com'
         AND internships.title = 'Machine Learning Engineer Intern'
       ON CONFLICT (application_id) DO NOTHING`,
      [JSON.stringify({
        demo: true,
        department: 'Applied AI Platform',
        currentWeek: 8,
        totalDurationWeeks: 24,
        progress: 34,
        hours: 272,
        totalHours: 800,
        reports: 7,
        totalReports: 24,
        mentor: 'Kavita Rao',
        mentorRole: 'Senior Machine Learning Engineer',
        weeklyHoursProgress: [
          { week: 'Wk 1', loggedHours: 34, targetHours: 35, cumulative: 34 },
          { week: 'Wk 2', loggedHours: 36, targetHours: 35, cumulative: 70 },
          { week: 'Wk 3', loggedHours: 32, targetHours: 35, cumulative: 102 },
          { week: 'Wk 4', loggedHours: 38, targetHours: 35, cumulative: 140 },
          { week: 'Wk 5', loggedHours: 33, targetHours: 35, cumulative: 173 },
          { week: 'Wk 6', loggedHours: 35, targetHours: 35, cumulative: 208 },
          { week: 'Wk 7', loggedHours: 30, targetHours: 35, cumulative: 238 },
          { week: 'Wk 8', loggedHours: 34, targetHours: 35, cumulative: 272 },
        ],
        milestones: [
          { id: 'demo-ml-1', title: 'Environment setup and data audit', status: 'completed', week: 'Week 1-2', date: 'Completed' },
          { id: 'demo-ml-2', title: 'Baseline model and evaluation plan', status: 'completed', week: 'Week 3-5', date: 'Completed' },
          { id: 'demo-ml-3', title: 'Feature pipeline and model iteration', status: 'in-progress', week: 'Week 6-10', date: 'In progress' },
          { id: 'demo-ml-4', title: 'API integration and monitoring', status: 'upcoming', week: 'Week 11-17', date: 'Upcoming' },
          { id: 'demo-ml-5', title: 'Final evaluation and handoff', status: 'upcoming', week: 'Week 18-24', date: 'Upcoming' },
        ],
        deadlines: [
          { id: 'demo-deadline-1', title: 'Submit weekly progress report', category: 'Internship Monitoring', dueDate: 'Friday, 5:00 PM', urgency: 'high', company: 'TechNova Solutions' },
          { id: 'demo-deadline-2', title: 'Review model evaluation with mentor', category: 'Project Milestone', dueDate: 'In 3 days', urgency: 'medium', company: 'TechNova Solutions' },
          { id: 'demo-deadline-3', title: 'Faculty progress check-in', category: 'Academic Milestone', dueDate: 'Next week', urgency: 'normal', company: 'Apex Institute of Technology' },
        ],
      })],
    );

    await client.query(
      `INSERT INTO student_internship_progress (application_id, progress_data)
       SELECT applications.id, demo.progress_data::JSONB
       FROM (VALUES
         ('aarav.patil@example.com', 'Machine Learning Engineer Intern', '{"demo":true,"mentor":"Rahul Mehta","mentorRole":"AI Platform Lead","progress":82,"hours":656,"totalHours":800,"tasks":18,"completedTasks":15,"reports":7,"totalReports":8,"evaluation":"Excellent","status":"On Track"}'),
         ('sneha.kulkarni@example.com', 'AI Research Intern', '{"demo":true,"mentor":"Priya Nair","mentorRole":"Research Scientist","progress":61,"hours":488,"totalHours":800,"tasks":22,"completedTasks":13,"reports":5,"totalReports":8,"evaluation":"Needs Review","status":"Attention"}')
       ) AS demo(student_email, title, progress_data)
       JOIN users student_user ON student_user.email = demo.student_email
       JOIN students ON students.user_id = student_user.id
       JOIN applications ON applications.student_id = students.id
       JOIN internships ON internships.id = applications.internship_id AND internships.title = demo.title
       JOIN companies ON companies.id = internships.company_id
       JOIN users company_user ON company_user.id = companies.user_id
       WHERE company_user.email = 'company@technova.com'
       ON CONFLICT (application_id) DO NOTHING`,
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = seedDemoPortal;