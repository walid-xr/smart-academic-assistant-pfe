CREATE DATABASE IF NOT EXISTS smart_academic_assistant;
USE smart_academic_assistant;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('teacher', 'student') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    class_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_students_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS homework_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    instructions TEXT NULL,
    due_date DATE NULL,
    assignment_type ENUM('questionnaire', 'pdf') NOT NULL DEFAULT 'questionnaire',
    file_path VARCHAR(255) NULL,
    file_name VARCHAR(255) NULL,
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

CREATE TABLE IF NOT EXISTS homework_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    assignment_id INT NULL,
    title VARCHAR(150) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    submission_mode ENUM('classic', 'questionnaire') NOT NULL DEFAULT 'classic',
    content LONGTEXT NULL,
    file_path VARCHAR(255) NULL,
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('submitted', 'processing', 'analyzed', 'reviewed') NOT NULL DEFAULT 'submitted',
    CONSTRAINT fk_homework_student
        FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_homework_assignment
        FOREIGN KEY (assignment_id) REFERENCES homework_assignments(id)
        ON DELETE CASCADE
);

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

CREATE TABLE IF NOT EXISTS homework_analysis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT NOT NULL UNIQUE,
    score DECIMAL(5,2) DEFAULT NULL,
    feedback TEXT DEFAULT NULL,
    grammar_score DECIMAL(5,2) DEFAULT NULL,
    structure_score DECIMAL(5,2) DEFAULT NULL,
    content_score DECIMAL(5,2) DEFAULT NULL,
    answered_questions_count INT DEFAULT 0,
    total_questions_count INT DEFAULT 0,
    missing_questions TEXT DEFAULT NULL,
    ai_probability DECIMAL(5,2) DEFAULT 0.00,
    plagiarism_percentage DECIMAL(5,2) DEFAULT 0.00,
    cheating_flag TINYINT(1) DEFAULT 0,
    reviewed_by_teacher TINYINT(1) DEFAULT 0,
    final_note DECIMAL(5,2) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_analysis_submission
        FOREIGN KEY (submission_id) REFERENCES homework_submissions(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_homework_student ON homework_submissions(student_id);
CREATE INDEX idx_homework_assignment ON homework_submissions(assignment_id);
CREATE INDEX idx_homework_subject ON homework_submissions(subject);
CREATE INDEX idx_homework_status ON homework_submissions(status);
CREATE UNIQUE INDEX idx_submission_assignment_student ON homework_submissions(student_id, assignment_id);
CREATE INDEX idx_assignment_teacher ON homework_assignments(teacher_id);
CREATE INDEX idx_assignment_question_assignment ON homework_assignment_questions(assignment_id);
CREATE INDEX idx_analysis_flag ON homework_analysis(cheating_flag);
CREATE INDEX idx_notifications_user ON notifications(user_id);
