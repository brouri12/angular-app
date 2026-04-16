USE challenge_db;

-- Options for Challenge 1 (questions 1,2,5)
INSERT INTO question_options (question_id, option_text) VALUES
(1, 'A piece of furniture with a flat top'),
(1, 'A type of food'),
(1, 'A vehicle'),
(1, 'A musical instrument'),
(2, 'Oven'),
(2, 'Refrigerator'),
(2, 'Washing machine'),
(2, 'Television'),
(5, 'An opening in a wall to let in light'),
(5, 'A type of door'),
(5, 'A piece of furniture'),
(5, 'A kitchen appliance');

-- Options for Challenge 2 (question 9)
INSERT INTO question_options (question_id, option_text) VALUES
(9, 'She work at a hospital.'),
(9, 'She works at a hospital.'),
(9, 'She working at a hospital.'),
(9, 'She worked at a hospital.');

-- Options for Challenge 3 (questions 11,13,15)
INSERT INTO question_options (question_id, option_text) VALUES
(11, 'Energy and diversity'),
(11, 'Low cost of living'),
(11, 'Clean air'),
(11, 'Quiet streets'),
(13, 'Traffic'),
(13, 'Beautiful parks'),
(13, 'Good weather'),
(13, 'Friendly people'),
(15, 'A rich mixture of different things'),
(15, 'A type of fabric'),
(15, 'A painting style'),
(15, 'A musical genre');

-- Options for Challenge 4 (questions 16,18,20)
INSERT INTO question_options (question_id, option_text) VALUES
(16, 'The amount of data that can be transmitted'),
(16, 'The speed of a computer processor'),
(16, 'The size of a hard drive'),
(16, 'The number of users on a network'),
(18, 'Storing and accessing data over the internet'),
(18, 'A type of weather phenomenon'),
(18, 'A programming language'),
(18, 'A computer hardware component'),
(20, 'Converts data into a coded format'),
(20, 'Deletes data permanently'),
(20, 'Speeds up internet connection'),
(20, 'Compresses files to save space');

-- Options for Challenge 5 (questions 22,25)
INSERT INTO question_options (question_id, option_text) VALUES
(22, 'had'),
(22, 'have'),
(22, 'has'),
(22, 'did'),
(25, 'He had eaten before she called.'),
(25, 'He has eaten before she called.'),
(25, 'He ate before she will call.'),
(25, 'He eating before she called.');

-- Challenge 6: Reading Climate Change (C1)
INSERT INTO questions (challenge_id, question_text, type, correct_answer, explanation, points, order_index) VALUES
(6, 'What does the passage identify as the main driver of climate change?', 'MULTIPLE_CHOICE', 'Human activities', 'The passage states human activities are driving unprecedented changes.', 7, 1),
(6, 'True or False: The scientific consensus on climate change is unclear.', 'TRUE_FALSE', 'False', 'The passage states the scientific consensus is clear.', 7, 2),
(6, 'What word means "never done or known before"?', 'MULTIPLE_CHOICE', 'Unprecedented', 'Unprecedented means never having happened or existed before.', 7, 3),
(6, 'Climate change has ___ consequences for ecosystems.', 'FILL_BLANK', 'far-reaching', 'The passage uses far-reaching consequences.', 7, 4),
(6, 'What is the main topic of the passage?', 'MULTIPLE_CHOICE', 'The urgency of climate change', 'The passage discusses climate change as one of the most pressing challenges.', 7, 5);

-- Challenge 7: Idioms Business English (B1)
INSERT INTO questions (challenge_id, question_text, type, correct_answer, explanation, points, order_index) VALUES
(7, 'What does "hit the ground running" mean?', 'MULTIPLE_CHOICE', 'To start something quickly and energetically', 'This idiom means to begin a new activity with great energy.', 4, 1),
(7, 'True or False: "Back to the drawing board" means to start over.', 'TRUE_FALSE', 'True', 'This idiom means to start again from the beginning after a failure.', 4, 2),
(7, 'What does "think outside the box" mean?', 'MULTIPLE_CHOICE', 'To think creatively and unconventionally', 'This idiom encourages creative thinking beyond conventional approaches.', 4, 3),
(7, '"Touch base" means to ___ with someone briefly.', 'FILL_BLANK', 'contact', 'To touch base means to make brief contact with someone.', 4, 4),
(7, 'What does "ballpark figure" mean?', 'MULTIPLE_CHOICE', 'An approximate number or estimate', 'A ballpark figure is a rough estimate or approximate number.', 4, 5);

-- Challenge 8: Writing Formal Email (B2)
INSERT INTO questions (challenge_id, question_text, type, correct_answer, explanation, points, order_index) VALUES
(8, 'Which is the most appropriate greeting for a formal email?', 'MULTIPLE_CHOICE', 'Dear Mr. Johnson,', 'Formal emails use Dear followed by the recipient title and surname.', 6, 1),
(8, 'True or False: "Hey!" is an appropriate opening for a formal email.', 'TRUE_FALSE', 'False', 'Formal emails require professional greetings like Dear Sir/Madam.', 6, 2),
(8, 'Which closing is appropriate for a formal email?', 'MULTIPLE_CHOICE', 'Yours sincerely,', 'Yours sincerely is a standard formal email closing.', 6, 3),
(8, 'A formal email should have a clear ___ line.', 'FILL_BLANK', 'subject', 'The subject line tells the recipient what the email is about.', 6, 4),
(8, 'Which sentence is written in a formal style?', 'MULTIPLE_CHOICE', 'I am writing to express my interest in the position.', 'Formal writing uses complete sentences and professional language.', 6, 5);
