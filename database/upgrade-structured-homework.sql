USE smart_academic_assistant;

CREATE TABLE IF NOT EXISTS homework_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    instructions TEXT NULL,
    due_date DATE NULL,
    status ENUM('draft', 'active', 'closed') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assignment_teacher
        FOREIGN KEY (teacher_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS homework_assignment_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_order INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_assignment_question_assignment
        FOREIGN KEY (assignment_id) REFERENCES homework_assignments(id)
        ON DELETE CASCADE
);

ALTER TABLE homework_submissions
    ADD COLUMN assignment_id INT NULL AFTER student_id,
    ADD COLUMN submission_mode ENUM('classic', 'questionnaire') NOT NULL DEFAULT 'classic' AFTER subject,
    ADD CONSTRAINT fk_homework_assignment
        FOREIGN KEY (assignment_id) REFERENCES homework_assignments(id)
        ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS homework_submission_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT NOT NULL,
    question_id INT NOT NULL,
    answer_text LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_submission_answer_submission
        FOREIGN KEY (submission_id) REFERENCES homework_submissions(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_submission_answer_question
        FOREIGN KEY (question_id) REFERENCES homework_assignment_questions(id)
        ON DELETE CASCADE
);

ALTER TABLE homework_analysis
    ADD COLUMN answered_questions_count INT DEFAULT 0 AFTER content_score,
    ADD COLUMN total_questions_count INT DEFAULT 0 AFTER answered_questions_count,
    ADD COLUMN missing_questions TEXT NULL AFTER total_questions_count;

CREATE INDEX idx_homework_assignment ON homework_submissions(assignment_id);
CREATE UNIQUE INDEX idx_submission_assignment_student ON homework_submissions(student_id, assignment_id);
CREATE INDEX idx_assignment_teacher ON homework_assignments(teacher_id);
CREATE INDEX idx_assignment_question_assignment ON homework_assignment_questions(assignment_id);

ALTER TABLE homework_assignments
    ADD COLUMN assignment_type ENUM('questionnaire', 'pdf') NOT NULL DEFAULT 'questionnaire' AFTER due_date,
    ADD COLUMN file_path VARCHAR(255) NULL AFTER assignment_type,
    ADD COLUMN file_name VARCHAR(255) NULL AFTER file_path;
