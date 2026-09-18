-- Seed data for smart_internship
-- Password for all demo accounts is: 123456

-- 1. Create Demo Users
INSERT INTO users (id, name, email, password_hash, role)
VALUES 
  (1, 'Alex Morgan', 'student@internpulse.com', '$2b$10$U.Ohce./hn38UhxQO/xoh.ZDhRhpIetIcQGaLhJ2g7RgGNwkJteHS', 'STUDENT'),
  (2, 'TechNova Recruiter', 'company@technova.com', '$2b$10$U.Ohce./hn38UhxQO/xoh.ZDhRhpIetIcQGaLhJ2g7RgGNwkJteHS', 'COMPANY'),
  (3, 'Dean of Placements', 'institution@apex.edu', '$2b$10$U.Ohce./hn38UhxQO/xoh.ZDhRhpIetIcQGaLhJ2g7RgGNwkJteHS', 'INSTITUTION'),
  (4, 'Platform Administrator', 'admin@internpulse.com', '$2b$10$U.Ohce./hn38UhxQO/xoh.ZDhRhpIetIcQGaLhJ2g7RgGNwkJteHS', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

SELECT setval('users_id_seq', (SELECT GREATEST(MAX(id), 10) FROM users));

-- 2. Create Student Profile
INSERT INTO students (id, user_id, college_name, course, branch, year, skills, phone)
VALUES
  (1, 1, 'Apex Institute of Technology', 'B.Tech', 'Computer Science & AI', 4, 'Python, Machine Learning, React, SQL, FastAPI, Git', '+91 98765 43210')
ON CONFLICT (user_id) DO UPDATE SET
  college_name = EXCLUDED.college_name,
  skills = EXCLUDED.skills;

SELECT setval('students_id_seq', (SELECT GREATEST(MAX(id), 10) FROM students));

-- 3. Create Company Profile
INSERT INTO companies (id, user_id, company_name, industry, website, location, description)
VALUES
  (1, 2, 'TechNova Solutions', 'Information Technology & AI', 'https://technova.example.com', 'Pune / Hybrid', 'Leading enterprise AI & Cloud innovation studio partnering with top institutions.')
ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name;

SELECT setval('companies_id_seq', (SELECT GREATEST(MAX(id), 10) FROM companies));

-- 4. Create Institution Profile
INSERT INTO institutions (id, user_id, institution_name, address, contact_number)
VALUES
  (1, 3, 'Apex Institute of Technology', 'Knowledge Park, Sector 62, Innovation Corridor', '+91 11 2345 6789')
ON CONFLICT (user_id) DO NOTHING;

SELECT setval('institutions_id_seq', (SELECT GREATEST(MAX(id), 10) FROM institutions));

-- 5. Seed Internships
INSERT INTO internships (id, company_id, title, description, skills_required, location, stipend, duration_months, start_date, end_date, status)
VALUES
  (1, 1, 'Machine Learning Engineer Intern', 'Build and deploy predictive models, NLP pipelines, and data pipelines for real-world intelligence workflows.', 'Python, Machine Learning, PyTorch, SQL', 'Pune / Hybrid', 25000.00, 6, '2026-07-01', '2026-12-31', 'POSTED'),
  (2, 1, 'Full-Stack Web Developer Intern', 'Develop modern responsive React frontends and robust Node.js / Express microservices.', 'React, Node.js, Express, JavaScript, REST API', 'Remote', 20000.00, 4, '2026-06-15', '2026-10-15', 'POSTED'),
  (3, 1, 'Cloud & DevOps Intern', 'Automate containerized CI/CD deployments using Docker, Kubernetes, and monitor distributed services.', 'Docker, Linux, CI/CD, AWS', 'Bengaluru', 22000.00, 6, '2026-08-01', '2027-01-31', 'POSTED')
ON CONFLICT (id) DO NOTHING;

SELECT setval('internships_id_seq', (SELECT GREATEST(MAX(id), 10) FROM internships));

-- 6. Seed Application & Ongoing Internship
INSERT INTO applications (id, internship_id, student_id, status)
VALUES
  (1, 1, 1, 'ONGOING'),
  (2, 2, 1, 'COMPLETED')
ON CONFLICT (internship_id, student_id) DO NOTHING;

SELECT setval('applications_id_seq', (SELECT GREATEST(MAX(id), 10) FROM applications));

-- 7. Seed Verified Certificate
INSERT INTO certificates (id, application_id, certificate_number, certificate_url, issued_date, verified)
VALUES
  (1, 2, 'CERT-IP-2026-0089', 'https://internpulse.example.com/verify/CERT-IP-2026-0089', '2026-05-30', TRUE)
ON CONFLICT (certificate_number) DO NOTHING;

SELECT setval('certificates_id_seq', (SELECT GREATEST(MAX(id), 10) FROM certificates));
