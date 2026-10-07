# School Database Design & Architecture

## 1. Table Descriptions & Entities

- **`students`**: Stores core information about registered students (Primary Key: `student_id`). Contains a `UNIQUE` constraint on `email` to prevent duplicate student accounts.
- **`courses`**: Stores course metadata and unique course identifiers (Primary Key: `course_id`). Contains a `UNIQUE` constraint on `course_code`.
- **`enrolments`**: Serves as a bridge/join table linking students to courses (Primary Key: `enrolment_id`). It holds interaction-specific attributes like `grade` and enrollment timestamps (`enrolled_at`).

## 2. Database Relationships & Join Table Explanation

- **One-to-Many ($1:N$) Relationships**:
  - One student can have **many** enrolments.
  - One course can have **many** enrolments.
- **Many-to-Many ($M:N$) Relationship**:
  - The relationship between `students` and `courses` is inherently **Many-to-Many** because a single student can take multiple courses, and a single course contains multiple students.
- **Why a Join Table is Needed**:
  - Relational databases cannot directly store arrays or list references across tables without violating First Normal Form (1NF). The `enrolments` join table decomposes the $M:N$ relationship into two $1:N$ relationships using Foreign Keys (`student_id`, `course_id`).
  - It allows attributes specific to the enrollment event (such as `grade`) to be tracked cleanly over time without duplicating course or student details.
  - Defining a composite unique constraint `UNIQUE(student_id, course_id)` on the join table acts as a crucial database safeguard against duplicate course enrollments.

## 3. Database Indexing Strategy

While defining `UNIQUE` constraints on `students(email)` automatically creates an index in database engines like SQLite and PostgreSQL for user authentication lookups, secondary indexes are vital for relational performance:

- **Indexes to Add**:
  ```sql
  CREATE INDEX idx_enrolments_student_id ON enrolments(student_id);
  CREATE INDEX idx_enrolments_course_id ON enrolments(course_id);
  ```
