# School Database Design & Architecture

## 1. Table Descriptions & Entities

- **`students`**: Stores core information about registered students (Primary Key: `student_id`). Contains a unique constraint on `email` to prevent duplicate accounts.
- **`courses`**: Represents subjects offered by the school (Primary Key: `course_id`). Stores course metadata and unique identifiers like `course_code`.
- **`enrolments`**: Acts as a bridge/join table storing student participation details (Primary Key: `enrolment_id`), including their current `grade` and enrollment timestamp.

## 2. Database Relationships & Join Table Explanation

- **One-to-Many Relationships**:
  - One student can have **many** enrolments.
  - One course can have **many** enrolments.
- **Many-to-Many Relationship**:
  - The relationship between `students` and `courses` is **Many-to-Many** ($M:N$) because a single student can enroll in multiple courses, and a single course can contain multiple enrolled students.
- **Why a Join Table is Needed**:
  - Relational databases cannot directly store arrays or list references across tables without violating First Normal Form (1NF). The `enrolments` join table decomposes the $M:N$ relationship into two $1:N$ relationships holding Foreign Keys (`student_id`, `course_id`). It also allows attributes specific to the interaction (like `grade`) to be stored cleanly.
  - A `UNIQUE(student_id, course_id)` constraint is enforced on the join table to prevent duplicate enrollments for the same course by a single student.

## 3. Database Indexing

- **Index to Add**:
  ```sql
  CREATE INDEX idx_students_email ON students(email);
  ```
