BEGIN;

CREATE TABLE IF NOT EXISTS student_institution_memberships (
  student_user_id INTEGER PRIMARY KEY REFERENCES students(user_id) ON DELETE CASCADE,
  institution_id INTEGER NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  assigned_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_student_institution_memberships_institution
  ON student_institution_memberships(institution_id);

INSERT INTO student_institution_memberships (student_user_id, institution_id, assigned_by)
SELECT 1, institutions.id, 4
FROM institutions
WHERE institutions.user_id = 3
  AND EXISTS (SELECT 1 FROM students WHERE students.user_id = 1)
  AND EXISTS (SELECT 1 FROM users WHERE users.id = 4 AND users.role = 'ADMIN')
ON CONFLICT (student_user_id) DO NOTHING;

COMMIT;