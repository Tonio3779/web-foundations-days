-- ============================================
-- DAY 6 ASSIGNMENT: A SCHOOL DATABASE
-- ============================================

-- Drop existing tables if re-running script to avoid duplicate table errors
DROP TABLE IF EXISTS enrolments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;

BEGIN TRANSACTION;

-- 1. CREATE TABLES
CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

CREATE TABLE courses (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE
);

CREATE TABLE enrolments (
    id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE (student_id, course_id)
);

-- 2. INSERT SAMPLE DATA
INSERT INTO students (id, name, email) VALUES
    (1, 'Anthony Obikwelu', 'anthony@example.com'),
    (2, 'Grace Okafor', 'grace@example.com'),
    (3, 'David Mensah', 'david@example.com'),
    (4, 'Sarah Williams', 'sarah@example.com');

INSERT INTO courses (id, name, code) VALUES
    (1, 'Web Development', 'WEB101'),
    (2, 'Database Systems', 'DB101'),
    (3, 'JavaScript Programming', 'JS101');

INSERT INTO enrolments (id, student_id, course_id, grade) VALUES
    (1, 1, 1, 'A'),
    (2, 1, 2, 'B'),
    (3, 2, 1, 'A'),
    (4, 2, 3, 'B'),
    (5, 3, 2, 'A');

COMMIT;

-- ============================================
-- 3. FIVE REQUIRED QUERIES
-- ============================================

-- Query 1: All courses for one student, searched by student name.
SELECT
    students.name AS student,
    courses.name AS course,
    courses.code,
    enrolments.grade
FROM students
JOIN enrolments ON students.id = enrolments.student_id
JOIN courses ON courses.id = enrolments.course_id
WHERE students.name = 'Anthony Obikwelu';

-- Query 2: All students enrolled on one course.
SELECT
    courses.name AS course,
    students.name AS student,
    enrolments.grade
FROM courses
JOIN enrolments ON courses.id = enrolments.course_id
JOIN students ON students.id = enrolments.student_id
WHERE courses.name = 'Web Development';

-- Query 3: Number of students per course.
SELECT
    courses.name AS course,
    COUNT(enrolments.student_id) AS student_count
FROM courses
LEFT JOIN enrolments ON courses.id = enrolments.course_id
GROUP BY courses.id, courses.name;

-- Query 4: Students who have no enrolments.
SELECT
    students.id,
    students.name,
    students.email
FROM students
LEFT JOIN enrolments ON students.id = enrolments.student_id
WHERE enrolments.student_id IS NULL;

-- Query 5: Update one enrolment's grade.
UPDATE enrolments
SET grade = 'A+'
WHERE student_id = 1
  AND course_id = 2;

-- Check the updated enrolment.
SELECT
    students.name AS student,
    courses.name AS course,
    enrolments.grade
FROM enrolments
JOIN students ON students.id = enrolments.student_id
JOIN courses ON courses.id = enrolments.course_id
WHERE enrolments.student_id = 1
  AND enrolments.course_id = 2;