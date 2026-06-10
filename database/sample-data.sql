USE smart_academic_assistant;

-- Demo passwords:
-- teacher@school.com -> teacher123
-- student1@school.com -> student123
-- student2@school.com -> student123

INSERT INTO users (id, name, email, password, role) VALUES
(1, 'Mme Salma Teacher', 'teacher@school.com', '$2a$10$0P8Gy5QnTqHv21hd.jwBFOYkZCAMhqu.D6v2Dh4CEF728Q.z.is7a', 'teacher'),
(2, 'Youssef Benali', 'student1@school.com', '$2a$10$.RG8.MpQVzUBasoUeqXs5elJFjjZktAobjcIPD2Z6tKkEKaBxqgtm', 'student'),
(3, 'Imane Alaoui', 'student2@school.com', '$2a$10$.RG8.MpQVzUBasoUeqXs5elJFjjZktAobjcIPD2Z6tKkEKaBxqgtm', 'student');

INSERT INTO students (id, user_id, class_name) VALUES
(1, 2, 'GI-2'),
(2, 3, 'GI-2');

INSERT INTO homework_assignments (id, teacher_id, title, subject, instructions, due_date, status) VALUES
(1, 1, 'Mini Quiz React', 'React', 'Answer all questions directly in the platform.', CURDATE() + INTERVAL 7 DAY, 'active');

INSERT INTO homework_assignment_questions (id, assignment_id, question_text, question_order) VALUES
(1, 1, 'What is React and why is it used?', 1),
(2, 1, 'Explain the role of components in a React application.', 2),
(3, 1, 'Give one simple example where AI can help in an academic platform.', 3);

INSERT INTO homework_submissions (
    id,
    student_id,
    assignment_id,
    title,
    subject,
    submission_mode,
    content,
    file_path,
    submission_date,
    status
) VALUES
(1, 1, NULL, 'Analyse de texte', 'French', 'classic', 'This homework discusses the importance of reading and how structured writing helps students communicate their ideas clearly.', NULL, NOW() - INTERVAL 3 DAY, 'reviewed'),
(2, 2, NULL, 'Analyse de texte', 'French', 'classic', 'This homework explains why reading is important for students and how good writing structure improves communication and understanding.', NULL, NOW() - INTERVAL 2 DAY, 'analyzed'),
(3, 1, NULL, 'Algorithm Basics', 'Algorithms', 'classic', 'Pending processing example for a newly submitted homework.', NULL, NOW() - INTERVAL 1 DAY, 'processing'),
(4, 1, 1, 'Mini Quiz React', 'React', 'questionnaire', 'Question 1: What is React and why is it used?\nAnswer: React is a JavaScript library used to build user interfaces.\n\nQuestion 2: Explain the role of components in a React application.\nAnswer: Components split the interface into reusable parts.\n\nQuestion 3: Give one simple example where AI can help in an academic platform.\nAnswer: AI can help correct homework automatically.', NULL, NOW() - INTERVAL 6 HOUR, 'analyzed');

INSERT INTO homework_submission_answers (submission_id, question_id, answer_text) VALUES
(4, 1, 'React is a JavaScript library used to build user interfaces.'),
(4, 2, 'Components split the interface into reusable parts.'),
(4, 3, 'AI can help correct homework automatically.');

INSERT INTO homework_analysis (
    id,
    submission_id,
    score,
    feedback,
    grammar_score,
    structure_score,
    content_score,
    ai_probability,
    plagiarism_percentage,
    cheating_flag,
    reviewed_by_teacher,
    final_note
) VALUES
(1, 1, 16.50, 'Bon travail dans l ensemble. L argument est clair et la structure est correcte. Ajoute plus d exemples pour ameliorer le contenu.', 16.00, 17.00, 16.50, 18.00, 32.00, 0, 1, 17.00),
(2, 2, 14.00, 'La soumission est comprehensible, mais elle doit etre mieux organisee et contenir plus de details originaux.', 14.50, 13.00, 14.00, 62.00, 58.00, 0, 0, NULL),
(3, 3, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0, 0, NULL),
(4, 4, 17.00, 'Toutes les questions ont ete traitees correctement avec des explications courtes mais pertinentes.', 17.00, 16.00, 18.00, 8.00, 0.00, 0, 0, NULL);

INSERT INTO notifications (user_id, type, message) VALUES
(2, 'submission', 'Votre devoir "Analyse de texte" a ete soumis avec succes.'),
(2, 'review', 'Votre devoir "Analyse de texte" a ete corrige par le professeur.'),
(3, 'analysis', 'Analyse terminee pour "Analyse de texte".');
