USE challenge_db;

-- Challenge 1: Vocabulary Daily Objects (A1)
INSERT INTO questions (challenge_id, question_text, type, correct_answer, explanation, points, order_index) VALUES
(1, 'What does the word "table" refer to?', 'MULTIPLE_CHOICE', 'A piece of furniture with a flat top', 'A table is a common piece of furniture used for eating or working.', 2, 1),
(1, 'Which word means a device used for cooking?', 'MULTIPLE_CHOICE', 'Oven', 'An oven is a kitchen appliance used for cooking and baking.', 2, 2),
(1, 'True or False: A chair is used for sitting.', 'TRUE_FALSE', 'True', 'A chair is a piece of furniture designed for sitting.', 2, 3),
(1, 'Fill in the blank: I use a ___ to write.', 'FILL_BLANK', 'pen', 'A pen is a writing instrument.', 2, 4),
(1, 'What is a "window"?', 'MULTIPLE_CHOICE', 'An opening in a wall to let in light', 'A window is an opening in a wall fitted with glass.', 2, 5);

-- Options for Challenge 1 questions
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

-- Challenge 2: Grammar Present Simple (A2)
INSERT INTO questions (challenge_id, question_text, type, correct_answer, explanation, points, order_index) VALUES
(2, 'She ___ to school every day. (go)', 'FILL_BLANK', 'goes', 'Third person singular adds -s or -es to the verb.', 3, 1),
(2, 'They ___ football on weekends. (play)', 'FILL_BLANK', 'play', 'With plural subjects, the verb stays in base form.', 3, 2),
(2, 'True or False: "He drink water" is correct.', 'TRUE_FALSE', 'False', 'Correct form is "He drinks water" - third person singular needs -s.', 3, 3),
(2, 'Which is correct?', 'MULTIPLE_CHOICE', 'She works at a hospital.', 'Third person singular (she/he/it) requires -s at the end of the verb.', 3, 4),
(2, 'I ___ coffee every morning. (drink)', 'FILL_BLANK', 'drink', 'First person singular uses the base form of the verb.', 3, 5);

INSERT INTO question_options (question_id, option_text) VALUES
(9, 'She work at a hospital.'),
(9, 'She works at a hospital.'),
(9, 'She working at a hospital.'),
(9, 'She worked at a hospital.');

-- Challenge 3: Reading The City Life (B1)
INSERT INTO questions (challenge_id, question_text, type, correct_answer, explanation, points, order_index) VALUES
(3, 'According to the passage, what makes cities fascinating?', 'MULTIPLE_CHOICE', 'Energy and diversity', 'The passage states cities are full of energy and diversity.', 4, 1),
(3, 'True or False: City life has no challenges according to the passage.', 'TRUE_FALSE', 'False', 'The passage mentions challenges like traffic, pollution, and high cost of living.', 4, 2),
(3, 'What is one challenge of city life mentioned in the passage?', 'MULTIPLE_CHOICE', 'Traffic', 'The passage mentions traffic as one of the challenges of city life.', 4, 3),
(3, 'People from ___ walks of life come together in cities.', 'FILL_BLANK', 'all', 'The passage says "people from all walks of life".', 4, 4),
(3, 'What does "tapestry" mean in the context of the passage?', 'MULTIPLE_CHOICE', 'A rich mixture of different things', 'Tapestry is used metaphorically to describe a rich mix of cultures.', 4, 5);

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

-- Challenge 4: Vocabulary Technology Terms (B2)
INSERT INTO questions (challenge_id, question_text, type, correct_answer, explanation, points, order_index) VALUES
(4, 'What does "bandwidth" refer to?', 'MULTIPLE_CHOICE', 'The amount of data that can be transmitted', 'Bandwidth measures data transmission capacity in a network.', 5, 1),
(4, 'True or False: A "firewall" is used to protect networks from unauthorized access.', 'TRUE_FALSE', 'True', 'A firewall is a security system that monitors and controls network traffic.', 5, 2),
(4, 'What is "cloud computing"?', 'MULTIPLE_CHOICE', 'Storing and accessing data over the internet', 'Cloud computing uses remote servers on the internet to store and process data.', 5, 3),
(4, 'An ___ is a set of rules for solving a problem in computing.', 'FILL_BLANK', 'algorithm', 'An algorithm is a step-by-step procedure for solving a problem.', 5, 4),
(4, 'What does "encryption" do?', 'MULTIPLE_CHOICE', 'Converts data into a coded format', 'Encryption converts readable data into an encoded format for security.', 5, 5);

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

-- Challenge 5: Grammar Past Perfect (B2)
INSERT INTO questions (challenge_id, question_text, type, correct_answer, explanation, points, order_index) VALUES
(5, 'By the time she arrived, he ___ already left. (leave)', 'FILL_BLANK', 'had', 'Past perfect uses had + past participle to show an action completed before another past action.', 5, 1),
(5, 'They ___ never seen snow before that winter.', 'MULTIPLE_CHOICE', 'had', 'Past perfect uses had + past participle.', 5, 2),
(5, 'True or False: "She had went" is correct past perfect.', 'TRUE_FALSE', 'False', 'Correct form is "She had gone" - past perfect uses past participle.', 5, 3),
(5, 'I ___ finished my homework before dinner. (finish)', 'FILL_BLANK', 'had', 'Past perfect: had + past participle (finished).', 5, 4),
(5, 'Which sentence uses past perfect correctly?', 'MULTIPLE_CHOICE', 'He had eaten before she called.', 'Past perfect shows an action completed before another past action.', 5, 5);

INSERT INTO question_options (question_id, option_text) VALUES
(22, 'had'),
(22, 'have'),
(22, 'has'),
(22, 'did'),
(26, 'He had eaten before she called.'),
(26, 'He has eaten before she called.'),
(26, 'He ate before she will call.'),
(26, 'He eating before she called.');

-- Challenge 6: Reading Climate Change (C1)
INSERT INTO questions (challenge_id, question_text, type, correct_answer, explanation, points, order_index) VALUES
(6, 'What does the passage identify as the main driver of climate change?', 'MULTIPLE_CHOICE', 'Human activities', 'The passage states human activities are driving unprecedented changes.', 7, 1),
(6, 'True or False: The scientific consensus on climate change is unclear.', 'TRUE_FALSE', 'False', 'The passage states the scientific consensus is clear.', 7, 2),
(6, 'What word in the passage means "never done or known before"?', 'MULTIPLE_CHOICE', 'Unprecedented', 'Unprecedented means never having happened or existed before.', 7, 3),
(6, 'Climate change has ___ consequences for ecosystems.', 'FILL_BLANK', 'far-reaching', 'The passage uses "far-reaching consequences".', 7, 4),
(6, 'What is the main topic of the passage?', 'MULTIPLE_CHOICE', 'The urgency of climate change', 'The passage discusses climate change as one of the most pressing challenges.', 7, 5);

INSERT INTO question_options (question_id, option_text) VALUES
(27, 'Human activities'),
(27, 'Natural disasters'),
(27, 'Animal migration'),
(27, 'Ocean currents'),
(29, 'Unprecedented'),
(29, 'Significant'),
(29, 'Moderate'),
(29, 'Gradual'),
(31, 'The urgency of climate change'),
(31, 'The history of weather patterns'),
(31, 'Solutions to pollution'),
(31, 'Benefits of industrialization');

-- Challenge 7: Idioms Business English (B1)
INSERT INTO questions (challenge_id, question_text, type, correct_answer, explanation, points, order_index) VALUES
(7, 'What does "hit the ground running" mean?', 'MULTIPLE_CHOICE', 'To start something quickly and energetically', 'This idiom means to begin a new activity with great energy and enthusiasm.', 4, 1),
(7, 'True or False: "Back to the drawing board" means to start over.', 'TRUE_FALSE', 'True', 'This idiom means to start again from the beginning after a failure.', 4, 2),
(7, 'What does "think outside the box" mean?', 'MULTIPLE_CHOICE', 'To think creatively and unconventionally', 'This idiom encourages creative thinking beyond conventional approaches.', 4, 3),
(7, '"Touch base" means to ___ with someone briefly.', 'FILL_BLANK', 'contact', 'To touch base means to make brief contact or communicate with someone.', 4, 4),
(7, 'What does "ballpark figure" mean?', 'MULTIPLE_CHOICE', 'An approximate number or estimate', 'A ballpark figure is a rough estimate or approximate number.', 4, 5);

INSERT INTO question_options (question_id, option_text) VALUES
(32, 'To start something quickly and energetically'),
(32, 'To run in a park'),
(32, 'To fall down'),
(32, 'To exercise regularly'),
(34, 'To think creatively and unconventionally'),
(34, 'To think about boxes'),
(34, 'To organize items in boxes'),
(34, 'To think slowly and carefully'),
(36, 'An approximate number or estimate'),
(36, 'A score in baseball'),
(36, 'A large amount of money'),
(36, 'A precise calculation');

-- Challenge 8: Writing Formal Email (B2)
INSERT INTO questions (challenge_id, question_text, type, correct_answer, explanation, points, order_index) VALUES
(8, 'Which is the most appropriate greeting for a formal email?', 'MULTIPLE_CHOICE', 'Dear Mr. Johnson,', 'Formal emails use "Dear" followed by the recipient title and surname.', 6, 1),
(8, 'True or False: "Hey!" is an appropriate opening for a formal email.', 'TRUE_FALSE', 'False', 'Formal emails require professional greetings like "Dear Sir/Madam".', 6, 2),
(8, 'Which closing is appropriate for a formal email?', 'MULTIPLE_CHOICE', 'Yours sincerely,', '"Yours sincerely" is a standard formal email closing.', 6, 3),
(8, 'A formal email should have a clear ___ line.', 'FILL_BLANK', 'subject', 'The subject line tells the recipient what the email is about.', 6, 4),
(8, 'Which sentence is written in a formal style?', 'MULTIPLE_CHOICE', 'I am writing to express my interest in the position.', 'Formal writing uses complete sentences and professional language.', 6, 5);

INSERT INTO question_options (question_id, option_text) VALUES
(37, 'Dear Mr. Johnson,'),
(37, 'Hey John!'),
(37, 'Hi there,'),
(37, 'Yo Johnson,'),
(39, 'Yours sincerely,'),
(39, 'See ya!'),
(39, 'Bye for now,'),
(39, 'Later,'),
(41, 'I am writing to express my interest in the position.'),
(41, 'I wanna get that job you posted.'),
(41, 'Give me the job please.'),
(41, 'Just checking if you got my application.');
