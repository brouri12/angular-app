-- ============================================================
-- 02_seed_games_and_questions.sql
-- 5 games: 3 QUIZ + 2 SENTENCE, 10 questions each
-- Run AFTER 01_clear_data.sql
-- Import in phpMyAdmin: gamified_learning database
-- ============================================================

USE gamified_learning;

-- ─── GAMES ────────────────────────────────────────────────────────────────────

INSERT INTO games (id, title, description, type, difficulty, is_active, created_at) VALUES
(1, 'English Vocabulary Quiz',   'Test your English vocabulary with fun multiple choice questions!',     'QUIZ',     'EASY',   1, NOW()),
(2, 'Advanced Grammar Quiz',     'Challenge yourself with advanced English grammar rules.',              'QUIZ',     'HARD',   1, NOW()),
(3, 'Everyday English Quiz',     'Common English expressions and phrases used in daily life.',           'QUIZ',     'MEDIUM', 1, NOW()),
(4, 'Sentence Completion',       'Fill in the blanks to complete the English sentences correctly.',      'SENTENCE', 'MEDIUM', 1, NOW()),
(5, 'Tenses & Verb Forms',       'Complete sentences using the correct tense or verb form.',             'SENTENCE', 'HARD',   1, NOW());

-- ─── GAME 1: English Vocabulary Quiz (QUIZ / EASY) — 10 questions ─────────────

INSERT INTO questions (id, game_id, question_text, correct_answer, explanation, points, order_index) VALUES
(1,  1, 'What does "happy" mean?',                    'feeling joy or pleasure',    'Happy describes a positive emotional state.',                10, 0),
(2,  1, 'What is the opposite of "hot"?',             'cold',                       'Cold is the opposite temperature of hot.',                   10, 1),
(3,  1, 'What does "enormous" mean?',                 'very large',                 'Enormous means extremely large in size.',                    10, 2),
(4,  1, 'What is a "library"?',                       'a place with books to read', 'A library is a building where books are kept for reading.',  10, 3),
(5,  1, 'What does "ancient" mean?',                  'very old',                   'Ancient means belonging to the very distant past.',          10, 4),
(6,  1, 'What is the meaning of "brave"?',            'showing courage',            'Brave means ready to face danger without fear.',             10, 5),
(7,  1, 'What does "transparent" mean?',              'see-through',                'Transparent means allowing light to pass through clearly.',  10, 6),
(8,  1, 'What is a "synonym"?',                       'a word with the same meaning','A synonym is a word that means the same as another word.',  10, 7),
(9,  1, 'What does "exhausted" mean?',                'very tired',                 'Exhausted means extremely tired.',                           10, 8),
(10, 1, 'What is the meaning of "generous"?',         'willing to give freely',     'Generous means giving more than expected.',                  10, 9);

INSERT INTO question_options (question_id, option_text) VALUES
(1,  'feeling joy or pleasure'), (1,  'feeling sad'),          (1,  'feeling angry'),       (1,  'feeling tired'),
(2,  'cold'),                    (2,  'warm'),                  (2,  'cool'),                (2,  'freezing'),
(3,  'very large'),              (3,  'very small'),            (3,  'very fast'),           (3,  'very quiet'),
(4,  'a place with books to read'),(4, 'a type of food'),       (4,  'a sports venue'),      (4,  'a hospital'),
(5,  'very old'),                (5,  'very new'),              (5,  'very expensive'),      (5,  'very common'),
(6,  'showing courage'),         (6,  'feeling scared'),        (6,  'being lazy'),          (6,  'being rude'),
(7,  'see-through'),             (7,  'very dark'),             (7,  'very heavy'),          (7,  'very soft'),
(8,  'a word with the same meaning'),(8,'a word with opposite meaning'),(8,'a type of verb'),(8,  'a punctuation mark'),
(9,  'very tired'),              (9,  'very happy'),            (9,  'very hungry'),         (9,  'very cold'),
(10, 'willing to give freely'),  (10, 'being selfish'),         (10, 'being angry'),         (10, 'being shy');

-- ─── GAME 2: Advanced Grammar Quiz (QUIZ / HARD) — 10 questions ───────────────

INSERT INTO questions (id, game_id, question_text, correct_answer, explanation, points, order_index) VALUES
(11, 2, 'Complete: "If I ____ you, I would apologize."',                    'were',              'Subjunctive mood uses "were" for hypothetical situations.',     15, 0),
(12, 2, 'Which is correct: "She ____ here since 2020."',                    'has been',          'Present perfect for actions continuing from the past.',         15, 1),
(13, 2, 'Complete: "Neither the students nor the teacher ____ ready."',     'was',               'With neither...nor, verb agrees with the nearest subject.',     15, 2),
(14, 2, 'Choose the correct passive: "The letter ____ yesterday."',         'was written',       'Past passive uses was/were + past participle.',                 15, 3),
(15, 2, 'Complete: "By the time she arrived, he ____ already left."',       'had',               'Past perfect for action completed before another past action.', 15, 4),
(16, 2, 'Which sentence uses the subjunctive correctly?',                   'I suggest that he be present.', 'Subjunctive uses base form after suggest/recommend.',  15, 5),
(17, 2, 'Complete: "She asked me where I ____."',                           'lived',             'Reported speech shifts present to past tense.',                 15, 6),
(18, 2, 'Choose correct: "I wish I ____ more time."',                       'had',               'Wish + past tense for present unreal situations.',              15, 7),
(19, 2, 'Complete: "The more you practice, ____ you improve."',             'the more',          'Comparative correlatives use the...the structure.',             15, 8),
(20, 2, 'Which is correct?',                                                'He is used to working late.', '"Used to" + gerund for habitual present actions.',      15, 9);

INSERT INTO question_options (question_id, option_text) VALUES
(11, 'was'), (11, 'were'), (11, 'am'), (11, 'be'),
(12, 'is'), (12, 'has been'), (12, 'was'), (12, 'have been'),
(13, 'were'), (13, 'was'), (13, 'are'), (13, 'is'),
(14, 'wrote'), (14, 'was written'), (14, 'has written'), (14, 'is written'),
(15, 'had'), (15, 'has'), (15, 'have'), (15, 'was'),
(16, 'I suggest that he is present.'), (16, 'I suggest that he be present.'), (16, 'I suggest that he was present.'), (16, 'I suggest that he being present.'),
(17, 'live'), (17, 'lived'), (17, 'was living'), (17, 'have lived'),
(18, 'have'), (18, 'had'), (18, 'has'), (18, 'having'),
(19, 'more'), (19, 'the more'), (19, 'most'), (19, 'much more'),
(20, 'He is use to work late.'), (20, 'He is used to working late.'), (20, 'He used to working late.'), (20, 'He is used to work late.');

-- ─── GAME 3: Everyday English Quiz (QUIZ / MEDIUM) — 10 questions ─────────────

INSERT INTO questions (id, game_id, question_text, correct_answer, explanation, points, order_index) VALUES
(21, 3, 'What does "break a leg" mean?',                    'good luck',             'Break a leg is an idiom meaning good luck.',                    10, 0),
(22, 3, 'What does "it is raining cats and dogs" mean?',    'it is raining heavily', 'This idiom means it is raining very hard.',                     10, 1),
(23, 3, 'What does "under the weather" mean?',              'feeling ill',           'Under the weather means feeling sick or unwell.',               10, 2),
(24, 3, 'What does "hit the books" mean?',                  'to study',              'Hit the books is an idiom meaning to study.',                   10, 3),
(25, 3, 'What does "bite the bullet" mean?',                'to endure a painful situation', 'Bite the bullet means to endure something difficult.',   10, 4),
(26, 3, 'What does "cost an arm and a leg" mean?',          'very expensive',        'This idiom means something is very costly.',                    10, 5),
(27, 3, 'What does "spill the beans" mean?',                'to reveal a secret',    'Spill the beans means to accidentally reveal information.',     10, 6),
(28, 3, 'What does "once in a blue moon" mean?',            'very rarely',           'Once in a blue moon means something that happens rarely.',      10, 7),
(29, 3, 'What does "the ball is in your court" mean?',      'it is your decision',   'This means it is now your turn to take action.',                10, 8),
(30, 3, 'What does "burn the midnight oil" mean?',          'to work late at night', 'Burn the midnight oil means to work or study late.',            10, 9);

INSERT INTO question_options (question_id, option_text) VALUES
(21, 'good luck'), (21, 'break something'), (21, 'run fast'), (21, 'be careful'),
(22, 'it is raining heavily'), (22, 'animals are falling'), (22, 'it is windy'), (22, 'it is snowing'),
(23, 'feeling ill'), (23, 'standing outside'), (23, 'being cold'), (23, 'feeling happy'),
(24, 'to study'), (24, 'to hit someone'), (24, 'to read slowly'), (24, 'to go to school'),
(25, 'to endure a painful situation'), (25, 'to eat a bullet'), (25, 'to be brave'), (25, 'to shoot something'),
(26, 'very expensive'), (26, 'to lose a limb'), (26, 'to pay in cash'), (26, 'to be cheap'),
(27, 'to reveal a secret'), (27, 'to make a mess'), (27, 'to cook beans'), (27, 'to be clumsy'),
(28, 'very rarely'), (28, 'every month'), (28, 'during full moon'), (28, 'very often'),
(29, 'it is your decision'), (29, 'play tennis'), (29, 'go to court'), (29, 'wait for someone'),
(30, 'to work late at night'), (30, 'to burn candles'), (30, 'to cook at night'), (30, 'to stay awake');

-- ─── GAME 4: Sentence Completion (SENTENCE / MEDIUM) — 10 questions ───────────

INSERT INTO questions (id, game_id, question_text, correct_answer, explanation, points, order_index) VALUES
(31, 4, 'The sky appears _____ on a clear day.',                    'blue',         'The sky is typically blue during daytime.',                  10, 0),
(32, 4, 'She _____ to school every day by bus.',                    'goes',         'Present simple third person singular uses goes.',            10, 1),
(33, 4, 'They _____ dinner when the phone rang.',                   'were having',  'Past continuous for action in progress when interrupted.',   10, 2),
(34, 4, 'He has _____ in Paris for three years.',                   'lived',        'Present perfect uses past participle.',                      10, 3),
(35, 4, 'The children _____ playing in the garden now.',            'are',          'Present continuous with plural subject uses are.',           10, 4),
(36, 4, 'We _____ go to the beach tomorrow if it is sunny.',        'will',         'Future simple uses will for predictions.',                   10, 5),
(37, 4, 'She _____ a beautiful painting last week.',                'painted',      'Past simple for completed action in the past.',              10, 6),
(38, 4, 'The dog _____ loudly when strangers approach.',            'barks',        'Present simple third person singular uses barks.',           10, 7),
(39, 4, 'By the time we arrived, the film _____ already started.',  'had',          'Past perfect for action completed before another past action.',10, 8),
(40, 4, 'I _____ never been to Japan before this trip.',            'had',          'Past perfect with never for first-time experiences.',        10, 9);

INSERT INTO question_options (question_id, option_text) VALUES
(31, 'blue'), (31, 'green'), (31, 'red'), (31, 'yellow'),
(32, 'go'), (32, 'goes'), (32, 'going'), (32, 'gone'),
(33, 'had'), (33, 'were having'), (33, 'have had'), (33, 'was having'),
(34, 'live'), (34, 'living'), (34, 'lived'), (34, 'lives'),
(35, 'is'), (35, 'are'), (35, 'was'), (35, 'were'),
(36, 'will'), (36, 'would'), (36, 'shall'), (36, 'should'),
(37, 'paint'), (37, 'painted'), (37, 'paints'), (37, 'painting'),
(38, 'bark'), (38, 'barks'), (38, 'barked'), (38, 'barking'),
(39, 'has'), (39, 'had'), (39, 'have'), (39, 'having'),
(40, 'have'), (40, 'had'), (40, 'has'), (40, 'having');

-- ─── GAME 5: Tenses & Verb Forms (SENTENCE / HARD) — 10 questions ─────────────

INSERT INTO questions (id, game_id, question_text, correct_answer, explanation, points, order_index) VALUES
(41, 5, 'If she _____ harder, she would have passed the exam.',             'had studied',       'Third conditional: if + past perfect, would have + past participle.', 15, 0),
(42, 5, 'By next year, he _____ working here for a decade.',                'will have been',    'Future perfect continuous for duration up to a future point.',         15, 1),
(43, 5, 'She insisted that he _____ the report immediately.',               'submit',            'Subjunctive mood after insist uses base form.',                        15, 2),
(44, 5, 'The report _____ by the team before the deadline.',                'had been completed','Past perfect passive for completed action before another past event.',  15, 3),
(45, 5, 'I would rather you _____ here tomorrow.',                          'came',              'Would rather + past tense for present/future preference.',             15, 4),
(46, 5, 'Hardly _____ sat down when the alarm went off.',                   'had I',             'Inversion after negative adverbs like hardly.',                        15, 5),
(47, 5, 'She acts as though she _____ the owner of the company.',           'were',              'Subjunctive were for hypothetical comparisons.',                       15, 6),
(48, 5, 'Not only _____ the test, but she also got the highest score.',     'did she pass',      'Inversion after not only at the beginning of a sentence.',             15, 7),
(49, 5, 'It is high time we _____ a decision about this matter.',           'made',              'It is high time + past tense for present necessity.',                  15, 8),
(50, 5, 'The data _____ been analyzed by the research team.',               'have',              'Data is plural, so use have.',                                         15, 9);

INSERT INTO question_options (question_id, option_text) VALUES
(41, 'studied'), (41, 'had studied'), (41, 'would study'), (41, 'studies'),
(42, 'will be'), (42, 'will have been'), (42, 'would have been'), (42, 'has been'),
(43, 'submits'), (43, 'submit'), (43, 'submitted'), (43, 'submitting'),
(44, 'completed'), (44, 'had been completed'), (44, 'was completing'), (44, 'has completed'),
(45, 'come'), (45, 'came'), (45, 'will come'), (45, 'coming'),
(46, 'I had'), (46, 'had I'), (46, 'I have'), (46, 'have I'),
(47, 'is'), (47, 'were'), (47, 'was'), (47, 'be'),
(48, 'she passed'), (48, 'did she pass'), (48, 'she did pass'), (48, 'passed she'),
(49, 'make'), (49, 'made'), (49, 'making'), (49, 'have made'),
(50, 'has'), (50, 'have'), (50, 'is'), (50, 'are');

-- ─── Verify ───────────────────────────────────────────────────────────────────

SELECT CONCAT('Games inserted: ', COUNT(*)) AS result FROM games;
SELECT CONCAT('Questions inserted: ', COUNT(*)) AS result FROM questions;
SELECT CONCAT('Options inserted: ', COUNT(*)) AS result FROM question_options;
SELECT g.title, COUNT(q.id) AS question_count FROM games g LEFT JOIN questions q ON q.game_id = g.id GROUP BY g.id, g.title;
