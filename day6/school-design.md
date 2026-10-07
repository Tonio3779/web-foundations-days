```markdown
# School Database Design

## Students Table

The `students` table stores information about each student. It contains the student's unique ID, name and email address. The `id` column is the primary key, which uniquely identifies each student. The email is also required to be unique so that two students cannot register with the same email address.

## Courses Table

The `courses` table stores information about the courses offered by the school. It contains a unique course ID, the course name and a unique course code. The `id` column is the primary key, while the course code is also unique so that each course can be identified clearly.

## Enrolments Table

The `enrolments` table records the fact that a student has enrolled on a particular course. It contains its own primary key, a `student_id`, a `course_id` and the student's grade for that course. The `student_id` and `course_id` columns are foreign keys that connect the enrolments table to the students and courses tables.

## Relationships

There is a one-to-many relationship between students and enrolments. One student can have many enrolments, but each enrolment belongs to one student.

There is also a one-to-many relationship between courses and enrolments. One course can have many enrolments, but each enrolment belongs to one course.

Students and courses therefore have a many-to-many relationship. One student can enrol in many courses, and one course can have many students. The `enrolments` table is needed as a join table because it connects students and courses and also stores information specific to the relationship, such as the student's grade. The `UNIQUE (student_id, course_id)` constraint prevents the same student from enrolling in the same course more than once.

## Index

I would add an index on `enrolments(student_id)` because student enrolment information will often be searched using the student's ID. An index can make these lookups faster, especially as the number of students and enrolments grows.

## SQL or NoSQL?

I would choose SQL for this school system because the data has clear relationships between students, courses and enrolments. The system needs primary keys, foreign keys, unique constraints, joins, grouping and reliable relationships between records. SQL databases are well suited to structured data and transactions where data consistency is important. A NoSQL database could work for a much larger or less structured system, but for this school database, a relational SQL database is the more appropriate choice.
```
