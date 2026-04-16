USE challenge_db;

-- =============================================
-- CHALLENGES
-- =============================================
INSERT INTO challenges (title, description, type, skill_focus, level, category, points, time_limit, content, created_by, created_at, is_public, tags, average_rating, total_attempts, successful_completions) VALUES
('Vocabulary: Daily Objects', 'Match words with their correct definitions about everyday objects.', 'VOCABULARY', 'VOCABULARY', 'A1', 'Daily Life', 10, 300, 'Choose the correct meaning for each word related to daily objects.', 1, NOW(), 1, 'vocabulary,beginner,objects', 4.5, 120, 95),
('Grammar: Present Simple', 'Practice using the present simple tense correctly.', 'GRAMMAR', 'GRAMMAR', 'A2', 'Grammar', 15, 600, 'Fill in the blanks with the correct form of the verb in present simple tense.', 1, NOW(), 1, 'grammar,present simple,elementary', 4.2, 200, 150),
('Reading: The City Life', 'Read the passage about city life and answer comprehension questions.', 'READING', 'READING', 'B1', 'Urban Life', 20, 900, 'Cities are fascinating places full of energy and diversity. People from all walks of life come together in urban environments.', 1, NOW(), 1, 'reading,comprehension,intermediate', 4.7, 85, 70),
('Vocabulary: Technology Terms', 'Learn and practice technology-related vocabulary.', 'VOCABULARY', 'VOCABULARY', 'B2', 'Technology', 25, 480, 'Match each technology term with its correct definition.', 1, NOW(), 1, 'vocabulary,technology,upper-intermediate', 4.3, 150, 110),
('Grammar: Past Perfect', 'Master the past perfect tense through exercises.', 'GRAMMAR', 'GRAMMAR', 'B2', 'Grammar', 25, 720, 'Complete the sentences using the past perfect tense. Remember: had + past participle.', 1, NOW(), 1, 'grammar,past perfect,upper-intermediate', 4.0, 180, 120),
('Reading: Climate Change', 'Advanced reading comprehension about environmental issues.', 'READING', 'READING', 'C1', 'Environment', 35, 1200, 'Climate change represents one of the most pressing challenges of our time.', 1, NOW(), 1, 'reading,environment,advanced', 4.8, 60, 52),
('Idioms: Business English', 'Learn common business idioms used in professional settings.', 'IDIOMS', 'VOCABULARY', 'B1', 'Business', 20, 600, 'Business English is full of idioms and expressions.', 1, NOW(), 1, 'idioms,business,intermediate', 4.4, 95, 75),
('Writing: Formal Email', 'Practice writing a formal email in English.', 'WRITING', 'WRITING', 'B2', 'Professional', 30, 1800, 'Write a formal email to a potential employer expressing your interest in a job position.', 1, NOW(), 1, 'writing,formal,professional', 4.1, 70, 45),
('Listening: Weather Forecast', 'Practice listening comprehension with a weather forecast.', 'LISTENING', 'LISTENING', 'A2', 'Weather', 15, 480, 'Listen to the weather forecast and answer the questions.', 1, NOW(), 1, 'listening,weather,elementary', 4.0, 110, 80),
('Mixed: English Proficiency Test', 'A comprehensive test covering all English skills.', 'MIXED', 'GRAMMAR', 'B1', 'General', 50, 1800, 'This test covers vocabulary, grammar, reading and writing skills.', 1, NOW(), 1, 'mixed,proficiency,intermediate', 4.6, 200, 140);

-- =============================================
-- QUESTIONS for Challenge 1 (Vocabulary A1)
-- =============================================
INSERT INTO questions (challenge_id, question_text, type, correct_answer, explanation, points, order_index) VALUES
(1, 'What does the word "table" refer to?', 'MULTIPLE_CHOICE', 'A piece of furniture with a flat top', 'A table is a common piece of furniture used for eating or working.', 2, 1),
(1, 'Which word means a device used for cooking?', 'MULTIPLE_CHOICE', 'Oven', 'An oven is a kitchen appliance used for cooking and baking.', 2, 2),
(1, 'True or False: A chair is used for sitting.', 'TRUE_FALSE', 'True', 'A chair is a piece of furniture designed for sitting.', 2, 3),
(1, 'Fill in the blank: I use a ___ to write.', 'FILL_BLANK', 'pen', 'A pen is a writing instrument.', 2, 4),
(1, 'What is a "window"?', 'MULTIPLE_CHOICE', 'An opening in a wall to let in light', 'A window is an opening in a wall fitted with glass.', 2, 5);

-- Options for Challenge 1
INSERT INTO question_options (question_id, option_text) VALUES
(1, 'A piece of furniture with a flat top'), (1, 'A type of food'), (1, 'A vehicle'), (1, 'A musical instrument'),
(2, 'Oven'), (2, 'Refrigerator'), (2, 'Washing machine'), (2, 'Television'),
(5, 'An opening in a wall to let in light'), (5, 'A type of door'), (5, 'A piece of furniture'), (5, 'A kitchen appliance');

-- =============================================
-- QUESTIONS for Challenge 2 (Grammar A2)
-- =============================================
INSERT INTO questions (challenge_id, question_text, type, correct_answer, explanation, points, order_index) VALUES
(2, 'She ___ to school every day. (go)', 'FILL_BLANK', 'goes', 'Third person singular adds -s or -es to the verb.', 3, 1),
(2, 'They ___ football on weekends. (play)', 'FILL_BLANK', 'play', 'With plural subjects, the verb stays in base form.', 3, 2),
(2, 'True or False: "He drink water" is correct.', 'TRUE_FALSE', 'False', 'Correct form is "He drinks water".', 3, 3),
(2, 'Which is correct?', 'MULTIPLE_CHOICE', 'She works at a hospital.', 'Third person singular requires -s at the end of the verb.', 3, 4),
(2, 'I ___ coffee every morning. (drink)', 'FILL_BLANK', 'drink', 'First person singular uses the base form of the verb.', 3, 5);

INSERT INTO question_options (question_id, option_text) VALUES
(9, 'She work at a hospital.'), (9, 'She works at a hospital.'), (9, 'She working at a hospital.'), (9, 'She worked at a hospital.');

-- =============================================
-- QUESTIONS for Challenge 3 (Reading B1)
-- =============================================
INSERT INTO questions (challenge_id, question_text, type, correct_answer, explanation, points, order_index) VALUES
(3, 'What makes cities fascinating according to the passage?', 'MULTIPLE_CHOICE', 'Energy and diversity', 'The passage states cities are full of energy and diversity.', 4, 1),
(3, 'True or False: City life has no challenges.', 'TRUE_FALSE', 'False', 'The passage mentions challenges like traffic and pollution.', 4, 2),
(3, 'What is one challenge of city life?', 'MULTIPLE_CHOICE', 'Traffic', 'The passage mentions traffic as one of the challenges.', 4, 3),
(3, 'People from ___ walks of life come together in cities.', 'FILL_BLANK', 'all', 'The passage says people from all walks of life.', 4, 4),
(3, 'What type of text is this passage?', 'MULTIPLE_CHOICE', 'Descriptive', 'The passage describes city life without telling a story.', 4, 5);

INSERT INTO question_options (question_id, option_text) VALUES
(11, 'Energy and diversity'), (11, 'Low cost of living'), (11, 'Clean air'), (11, 'Quiet streets'),
(13, 'Traffic'), (13, 'Beautiful parks'), (13, 'Good weather'), (13, 'Friendly people'),
(15, 'Descriptive'), (15, 'Narrative'), (15, 'Argumentative'), (15, 'Instructional');

-- =============================================
-- QUESTIONS for Challenge 4 (Vocabulary B2)
-- =============================================
INSERT INTO questions (challenge_id, question_text, type, correct_answer, explanation, points, order_index) VALUES
(4, 'What does "bandwidth" refer to?', 'MULTIPLE_CHOICE', 'The amount of data that can be transmitted', 'Bandwidth measures data transmission capacity.', 5, 1),
(4, 'True or False: A firewall protects networks from unauthorized access.', 'TRUE_FALSE', 'True', 'A firewall is a security system that monitors network traffic.', 5, 2),
(4, 'What is "cloud computing"?', 'MULTIPLE_CHOICE', 'Storing and accessing data over the internet', 'Cloud computing uses remote servers on the internet.', 5, 3),
(4, 'An ___ is a step-by-step procedure for solving a problem.', 'FILL_BLANK', 'algorithm', 'An algorithm is a set of rules for solving a problem.', 5, 4),
(4, 'What does "encryption" do?', 'MULTIPLE_CHOICE', 'Converts data into a coded format', 'Encryption converts readable data into an encoded format.', 5, 5);

INSERT INTO question_options (question_id, option_text) VALUES
(16, 'The amount of data that can be transmitted'), (16, 'The speed of a processor'), (16, 'The size of a hard drive'), (16, 'The number of users'),
(18, 'Storing and accessing data over the internet'), (18, 'A weather phenomenon'), (18, 'A programming language'), (18, 'A hardware component'),
(20, 'Converts data into a coded format'), (20, 'Deletes data permanently'), (20, 'Speeds up internet'), (20, 'Compresses files');

-- =============================================
-- QUESTIONS for Challenge 5 (Grammar B2)
-- =============================================
INSERT INTO questions (challenge_id, question_text, type, correct_answer, explanation, points, order_index) VALUES
(5, 'By the time she arrived, he ___ already left.', 'FILL_BLANK', 'had', 'Past perfect uses had + past participle.', 5, 1),
(5, 'They ___ never seen snow before that winter.', 'MULTIPLE_CHOICE', 'had', 'Past perfect uses had + past participle.', 5, 2),
(5, 'True or False: "She had went" is correct past perfect.', 'TRUE_FALSE', 'False', 'Correct form is "She had gone".', 5, 3),
(5, 'I ___ finished my homework before dinner.', 'FILL_BLANK', 'had', 'Past perfect: had + past participle.', 5, 4),
(5, 'Which sentence uses past perfect correctly?', 'MULTIPLE_CHOICE', 'He had eaten before she called.', 'Past perfect shows an action completed before another past action.', 5, 5);

INSERT INTO question_options (question_id, option_text) VALUES
(22, 'had'), (22, 'have'), (22, 'has'), (22, 'did'),
(25, 'He had eaten before she called.'), (25, 'He has eaten before she called.'), (25, 'He ate before she will call.'), (25, 'He eating before she called.');

-- =============================================
-- QUESTIONS for Challenge 6 (Reading C1)
-- =============================================
INSERT INTO questions (challenge_id, question_text, type, correct_answer, explanation, points, order_index) VALUES
(6, 'What is the main driver of climate change?', 'MULTIPLE_CHOICE', 'Human activities', 'The passage states human activities are driving changes.', 7, 1),
(6, 'True or False: The scientific consensus on climate change is unclear.', 'TRUE_FALSE', 'False', 'The passage states the scientific consensus is clear.', 7, 2),
(6, 'What word means "never done before"?', 'MULTIPLE_CHOICE', 'Unprecedented', 'Unprecedented means never having happened before.', 7, 3),
(6, 'Climate change has ___ consequences for ecosystems.', 'FILL_BLANK', 'far-reaching', 'The passage uses far-reaching consequences.', 7, 4),
(6, 'What is the main topic of the passage?', 'MULTIPLE_CHOICE', 'The urgency of climate change', 'The passage discusses climate change as a pressing challenge.', 7, 5);

INSERT INTO question_options (question_id, option_text) VALUES
(26, 'Human activities'), (26, 'Natural disasters'), (26, 'Animal migration'), (26, 'Ocean currents'),
(28, 'Unprecedented'), (28, 'Significant'), (28, 'Moderate'), (28, 'Gradual'),
(30, 'The urgency of climate change'), (30, 'History of weather'), (30, 'Solutions to pollution'), (30, 'Benefits of industry');

-- =============================================
-- QUESTIONS for Challenge 7 (Idioms B1)
-- =============================================
INSERT INTO questions (challenge_id, question_text, type, correct_answer, explanation, points, order_index) VALUES
(7, 'What does "hit the ground running" mean?', 'MULTIPLE_CHOICE', 'To start something quickly and energetically', 'This idiom means to begin with great energy.', 4, 1),
(7, 'True or False: "Back to the drawing board" means to start over.', 'TRUE_FALSE', 'True', 'This idiom means to start again from the beginning.', 4, 2),
(7, 'What does "think outside the box" mean?', 'MULTIPLE_CHOICE', 'To think creatively and unconventionally', 'This idiom encourages creative thinking.', 4, 3),
(7, '"Touch base" means to ___ with someone briefly.', 'FILL_BLANK', 'contact', 'To touch base means to make brief contact.', 4, 4),
(7, 'What does "ballpark figure" mean?', 'MULTIPLE_CHOICE', 'An approximate number or estimate', 'A ballpark figure is a rough estimate.', 4, 5);

INSERT INTO question_options (question_id, option_text) VALUES
(31, 'To start something quickly and energetically'), (31, 'To run in a park'), (31, 'To fall down'), (31, 'To exercise regularly'),
(33, 'To think creatively and unconventionally'), (33, 'To think about boxes'), (33, 'To organize items'), (33, 'To think slowly'),
(35, 'An approximate number or estimate'), (35, 'A baseball score'), (35, 'A large amount of money'), (35, 'A precise calculation');

-- =============================================
-- QUESTIONS for Challenge 8 (Writing B2)
-- =============================================
INSERT INTO questions (challenge_id, question_text, type, correct_answer, explanation, points, order_index) VALUES
(8, 'Which is the most appropriate greeting for a formal email?', 'MULTIPLE_CHOICE', 'Dear Mr. Johnson,', 'Formal emails use Dear followed by title and surname.', 6, 1),
(8, 'True or False: "Hey!" is appropriate for a formal email.', 'TRUE_FALSE', 'False', 'Formal emails require professional greetings.', 6, 2),
(8, 'Which closing is appropriate for a formal email?', 'MULTIPLE_CHOICE', 'Yours sincerely,', 'Yours sincerely is a standard formal closing.', 6, 3),
(8, 'A formal email should have a clear ___ line.', 'FILL_BLANK', 'subject', 'The subject line tells the recipient what the email is about.', 6, 4),
(8, 'Which sentence is written in a formal style?', 'MULTIPLE_CHOICE', 'I am writing to express my interest in the position.', 'Formal writing uses complete professional sentences.', 6, 5);

INSERT INTO question_options (question_id, option_text) VALUES
(36, 'Dear Mr. Johnson,'), (36, 'Hey John!'), (36, 'Hi there,'), (36, 'Yo Johnson,'),
(38, 'Yours sincerely,'), (38, 'See ya!'), (38, 'Bye for now,'), (38, 'Later,'),
(40, 'I am writing to express my interest in the position.'), (40, 'I wanna get that job.'), (40, 'Give me the job please.'), (40, 'Just checking if you got my application.');

-- =============================================
-- QUESTIONS for Challenge 9 (Listening A2)
-- =============================================
INSERT INTO questions (challenge_id, question_text, type, correct_answer, explanation, points, order_index) VALUES
(9, 'What is the weather like today according to the forecast?', 'MULTIPLE_CHOICE', 'Sunny with some clouds', 'The forecast describes a mostly sunny day.', 3, 1),
(9, 'True or False: It will rain in the afternoon.', 'TRUE_FALSE', 'False', 'The forecast says no rain expected.', 3, 2),
(9, 'What is the temperature today?', 'MULTIPLE_CHOICE', '25 degrees Celsius', 'The forecast mentions 25 degrees.', 3, 3),
(9, 'The wind is blowing from the ___.', 'FILL_BLANK', 'north', 'The forecast mentions northerly winds.', 3, 4),
(9, 'What should you bring if going outside?', 'MULTIPLE_CHOICE', 'Sunglasses', 'Sunny weather means sunglasses are recommended.', 3, 5);

INSERT INTO question_options (question_id, option_text) VALUES
(41, 'Sunny with some clouds'), (41, 'Heavy rain'), (41, 'Snowing'), (41, 'Foggy'),
(43, '25 degrees Celsius'), (43, '10 degrees Celsius'), (43, '35 degrees Celsius'), (43, '0 degrees Celsius'),
(45, 'Sunglasses'), (45, 'Umbrella'), (45, 'Winter coat'), (45, 'Rain boots');

-- =============================================
-- QUESTIONS for Challenge 10 (Mixed B1)
-- =============================================
INSERT INTO questions (challenge_id, question_text, type, correct_answer, explanation, points, order_index) VALUES
(10, 'Choose the correct word: She ___ to the store yesterday.', 'MULTIPLE_CHOICE', 'went', 'Went is the past tense of go.', 5, 1),
(10, 'True or False: "More better" is correct English.', 'TRUE_FALSE', 'False', 'The correct form is simply "better".', 5, 2),
(10, 'What does "perseverance" mean?', 'MULTIPLE_CHOICE', 'Continued effort despite difficulty', 'Perseverance means persistence in doing something despite difficulty.', 5, 3),
(10, 'The opposite of "ancient" is ___.', 'FILL_BLANK', 'modern', 'Modern is the antonym of ancient.', 5, 4),
(10, 'Which sentence is grammatically correct?', 'MULTIPLE_CHOICE', 'Neither of the students has finished.', 'Neither takes a singular verb.', 5, 5);

INSERT INTO question_options (question_id, option_text) VALUES
(46, 'went'), (46, 'go'), (46, 'gone'), (46, 'goes'),
(48, 'Continued effort despite difficulty'), (48, 'Fear of failure'), (48, 'Quick success'), (48, 'Lack of motivation'),
(50, 'Neither of the students has finished.'), (50, 'Neither of the students have finished.'), (50, 'Neither of the student has finished.'), (50, 'Neither students has finished.');
