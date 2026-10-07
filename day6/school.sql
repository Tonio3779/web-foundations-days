-- Disable foreign key enforcement check override (Enables FK constraints in SQLite)
PRAGMA foreign_keys = ON;

-- -----------------------------------------------------------------------------
-- 1. TABLE CREATION
-- -----------------------------------------------------------------------------

CREATE TABLE students (
    student_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
    course_id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_name TEXT NOT NULL,
    course_code TEXT NOT NULL UNIQUE
);

CREATE TABLE enrolments (
    enrolment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT,
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    UNIQUE (student_id, course_id) -- Prevents duplicate course enrollment for the same student
);

-- -----------------------------------------------------------------------------
-- 2. SAMPLE DATA INSERTION
-- -----------------------------------------------------------------------------

-- Insert 4 Students (3 enrolled, 1 without enrolments to test Query 4)
INSERT INTO students (name, email) VALUES
('Alice Smith', 'alice@example.com'),
('Bob Jones', 'bob@example.com'),
('Charlie Brown', 'charlie@example.com'),
('Diana Prince', 'diana@example.com');

-- Insert 3 Courses
INSERT INTO courses (course_name, course_code) VALUES
('Web Foundations', 'CS101'),
('Database Systems', 'CS102'),
('JavaScript Basics', 'CS103');

-- Insert 5 Enrolments
INSERT INTO enrolments (student_id, course_id, grade) VALUES
(1, 1, 'A'), -- Alice -> Web Foundations
(1, 2, 'B'), -- Alice -> Database Systems
(2, 1, 'B'), -- Bob -> Web Foundations
(2, 3, 'A'), -- Bob -> JavaScript Basics
(3, 2, 'C'); -- Charlie -> Database Systems

-- -----------------------------------------------------------------------------
-- 3. FIVE REQUIRED QUERIES
-- -----------------------------------------------------------------------------

-- Query 1: All courses for one student (by student name: 'Alice Smith')
SELECT s.name AS student_name, c.course_name, c.course_code, e.grade
FROM students s
JOIN enrolments e ON s.student_id = e.student_id
JOIN courses c ON e.course_id = c.course_id
WHERE s.name = 'Alice Smith';

-- Query 2: All students on one course (by course name: 'Web Foundations')
SELECT c.course_name, s.name AS student_name, s.email, e.grade
FROM courses c
JOIN enrolments e ON c.course_id = e.course_id
JOIN students s ON e.student_id = s.student_id
WHERE c.course_name = 'Web Foundations';

-- Query 3: The number of students per course
SELECT c.course_name, COUNT(e.student_id) AS student_count
FROM courses c
LEFT JOIN enrolments e ON c.course_id = e.course_id
GROUP BY c.course_id, c.course_name;

-- Query 4: Students who have no enrolments
SELECT s.student_id, s.name, s.email
FROM students s
LEFT JOIN enrolments e ON s.student_id = e.student_id
WHERE e.enrolment_id IS NULL;

-- Query 5: Update of one enrolment's grade (updating Charlie's CS102 grade from 'C' to 'A')
UPDATE enrolments
SET grade = 'A'
WHERE student_id = (SELECT student_id FROM students WHERE name = 'Charlie Brown')
  AND course_id = (SELECT course_id FROM courses WHERE course_code = 'CS102');

-- Verification for Query 5 (optional check)
SELECT s.name, c.course_code, e.grade
FROM enrolments e
JOIN students s ON e.student_id = s.student_id
JOIN courses c ON e.course_id = c.course_id
WHERE s.name = 'Charlie Brown';