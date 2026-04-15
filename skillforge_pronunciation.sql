-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mer. 01 avr. 2026 à 11:08
-- Version du serveur : 5.7.36
-- Version de PHP : 8.1.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `skillforge_pronunciation`
--

-- --------------------------------------------------------

--
-- Structure de la table `challenge_keywords`
--

DROP TABLE IF EXISTS `challenge_keywords`;
CREATE TABLE IF NOT EXISTS `challenge_keywords` (
  `challenge_id` bigint(20) NOT NULL,
  `keyword` varchar(255) DEFAULT NULL,
  KEY `FK5ug59j5v0qkcrfpehfdqmwtp6` (`challenge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `challenge_keywords`
--

INSERT INTO `challenge_keywords` (`challenge_id`, `keyword`) VALUES
(9, 'qdsfqdsfqdsf');

-- --------------------------------------------------------

--
-- Structure de la table `phoneme_examples`
--

DROP TABLE IF EXISTS `phoneme_examples`;
CREATE TABLE IF NOT EXISTS `phoneme_examples` (
  `phoneme_id` bigint(20) NOT NULL,
  `example_word` varchar(255) DEFAULT NULL,
  KEY `FKda1et9met66d4crndjhev20ma` (`phoneme_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `phoneme_library`
--

DROP TABLE IF EXISTS `phoneme_library`;
CREATE TABLE IF NOT EXISTS `phoneme_library` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `audio_example_url` varchar(500) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `tips_for_students` varchar(1000) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `symbol` varchar(255) NOT NULL,
  `category` enum('CONSONANT_SOURDE','CONSONANT_VOISEE','VOWEL_COURTE','VOWEL_LONGUE','DIPHTHONQUE') DEFAULT NULL,
  `typical_level` enum('A1','A2','B1','B2','C1','C2') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_sc77kv9jaehlr6xjl47xisqk8` (`symbol`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `pronunciation_challenges`
--

DROP TABLE IF EXISTS `pronunciation_challenges`;
CREATE TABLE IF NOT EXISTS `pronunciation_challenges` (
  `actif` bit(1) NOT NULL,
  `average_score` float DEFAULT NULL,
  `total_submissions` int(11) DEFAULT NULL,
  `date_posted` datetime(6) NOT NULL,
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `audio_reference_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phrase` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tips` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phonetic_transcription` text COLLATE utf8mb4_unicode_ci,
  `difficulty` enum('BEGINNER','EASY','MEDIUM','HARD','EXPERT') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `niveau` enum('A1','A2','B1','B2','C1','C2') COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('MOT','PHRASE','DIALOGUE','CONVERSATION','PARAGRAPHE') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `pronunciation_challenges`
--

INSERT INTO `pronunciation_challenges` (`actif`, `average_score`, `total_submissions`, `date_posted`, `id`, `audio_reference_url`, `description`, `phrase`, `tips`, `phonetic_transcription`, `difficulty`, `niveau`, `type`) VALUES
(b'0', 0, 0, '2026-03-26 10:33:37.107678', 1, NULL, 'Basic greeting', 'Hello, how are you?', 'Practice the \'h\' sound and the \'ou\' sound', '/həˈlaʊ haʊ ɑːr juː/', 'EASY', 'A1', 'PHRASE'),
(b'1', 0, 0, '2026-03-26 10:33:37.151571', 2, NULL, 'Introducing yourself', 'My name is John.', 'Focus on the \'ay\' sound in \'name\'', '/maɪ neɪm ɪz dʒɒn/', 'EASY', 'A1', 'PHRASE'),
(b'1', 0, 0, '2026-03-26 10:33:37.154585', 3, NULL, 'Talking about weather', 'The weather is nice today.', 'Pay attention to the \'th\' sound', '/ðə ˈweðər ɪz naɪs təˈdeɪ/', 'MEDIUM', 'A2', 'PHRASE'),
(b'1', 0, 0, '2026-03-26 10:33:37.156582', 4, NULL, 'Ordering at a café', 'I would like a cup of coffee, please.', 'Practice the \'w\' and \'l\' sounds', '/aɪ wʊd laɪk ə kʌp əv ˈkɒfi pliːz/', 'MEDIUM', 'A2', 'PHRASE'),
(b'1', 0, 0, '2026-03-26 10:33:37.158649', 5, NULL, 'Common expression', 'Think before you speak.', 'The \'th\' sound at the beginning of \'think\'', '/θɪŋk bɪˈfɔːr juː spiːk/', 'MEDIUM', 'B1', 'PHRASE'),
(b'1', 0, 0, '2026-03-26 10:33:37.160303', 6, NULL, 'Tongue twister', 'She sells seashells by the seashore.', 'Challenge yourself with the \'s\' and \'sh\' sounds', '/ʃiː sɛlz ˈsiːʃɛlz baɪ ðə ˈsiːʃɔːr/', 'HARD', 'B1', 'PHRASE'),
(b'0', 0, 0, '2026-03-26 10:33:37.163594', 7, NULL, 'Advanced tongue twister', 'Through three three-thousand thermometers.', 'Focus on the \'th\' sound variations', '/θruː θriː θrɪˈθaʊzənd θəˈrɒmɪtərz/', 'EXPERT', 'B2', 'PHRASE'),
(b'0', 0, 0, '2026-03-26 10:33:37.165216', 8, NULL, 'Complex tongue twister', 'aaaaaaaaaaaaaaa', 'Master the \'th\' sound in different positions', '/ðə ˈθɜːrti θriː θiːvz θɪŋk ðeɪ ɑːr ðə bɛst θiːvz/', 'EXPERT', 'B2', 'PHRASE'),
(b'0', 0, 0, '2026-03-26 20:09:25.967179', 9, 'qdsfdqsfqds', 'qdsf', 'aaaaaaaaaaa', 'qsdfqsssd', 'qdsfqdfs', 'MEDIUM', 'A1', 'MOT'),
(b'0', 0, 0, '2026-03-28 14:04:35.963591', 10, NULL, 'sqdf^à^àqdsf', 'p^^pdsf', NULL, 'p^qdsf^pqdfs', 'HARD', 'B2', 'DIALOGUE'),
(b'1', 0, 0, '2026-03-28 14:04:56.474509', 11, NULL, 'pd^fqs^pqdsfpds', 'qdsp^f^pdf', NULL, '^qpdsf^pdqsf', 'HARD', 'B1', 'DIALOGUE');

-- --------------------------------------------------------

--
-- Structure de la table `recording_problematic_phonemes`
--

DROP TABLE IF EXISTS `recording_problematic_phonemes`;
CREATE TABLE IF NOT EXISTS `recording_problematic_phonemes` (
  `recording_id` bigint(20) NOT NULL,
  `phoneme` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  KEY `FKby67s0dk2sv1ytfrw4jq51kqw` (`recording_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `recording_problematic_phonemes`
--

INSERT INTO `recording_problematic_phonemes` (`recording_id`, `phoneme`) VALUES
(11, 'θ'),
(11, 'ð'),
(12, 'θ'),
(12, 'ð'),
(13, 'θ'),
(13, 'ð'),
(14, 'θ'),
(14, 'æ'),
(15, 'θ'),
(15, 'æ'),
(19, 'θ'),
(19, 'æ');

-- --------------------------------------------------------

--
-- Structure de la table `user_earned_badges`
--

DROP TABLE IF EXISTS `user_earned_badges`;
CREATE TABLE IF NOT EXISTS `user_earned_badges` (
  `user_progress_id` bigint(20) NOT NULL,
  `badge` varchar(255) DEFAULT NULL,
  KEY `FKll3sxcks4oehy8h6wsn91u2uk` (`user_progress_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `user_progress`
--

DROP TABLE IF EXISTS `user_progress`;
CREATE TABLE IF NOT EXISTS `user_progress` (
  `average_scorea1` float DEFAULT NULL,
  `average_scorea2` float DEFAULT NULL,
  `average_scoreb1` float DEFAULT NULL,
  `average_scoreb2` float DEFAULT NULL,
  `average_scorec1` float DEFAULT NULL,
  `average_scorec2` float DEFAULT NULL,
  `best_streak` int(11) DEFAULT NULL,
  `current_streak` int(11) DEFAULT NULL,
  `global_average_score` float DEFAULT NULL,
  `total_challenges_completed` int(11) DEFAULT NULL,
  `total_recordings` int(11) DEFAULT NULL,
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `last_activity_date` datetime(6) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL,
  `estimated_level` enum('A1','A2','B1','B2','C1','C2') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_mfk6n2nvwx2deqabhbwkb7x80` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `user_recordings`
--

DROP TABLE IF EXISTS `user_recordings`;
CREATE TABLE IF NOT EXISTS `user_recordings` (
  `attempt_number` int(11) DEFAULT NULL,
  `clarity_score` float DEFAULT NULL,
  `duration_seconds` int(11) DEFAULT NULL,
  `fluency_score` float DEFAULT NULL,
  `intonation_score` float DEFAULT NULL,
  `overall_score` float DEFAULT NULL,
  `pronunciation_score` float DEFAULT NULL,
  `challenge_id` bigint(20) NOT NULL,
  `evaluated_at` datetime(6) DEFAULT NULL,
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `submitted_at` datetime(6) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `audio_storage_path` varchar(500) DEFAULT NULL,
  `audio_url` varchar(500) NOT NULL,
  `improvement_tips` varchar(1000) DEFAULT NULL,
  `ai_feedback` varchar(2000) DEFAULT NULL,
  `status` enum('PENDING','PROCESSING','COMPLETED','FAILED') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKfcyaocei09xlp93xruq8iwbo6` (`challenge_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `user_recordings`
--

INSERT INTO `user_recordings` (`attempt_number`, `clarity_score`, `duration_seconds`, `fluency_score`, `intonation_score`, `overall_score`, `pronunciation_score`, `challenge_id`, `evaluated_at`, `id`, `submitted_at`, `user_id`, `audio_storage_path`, `audio_url`, `improvement_tips`, `ai_feedback`, `status`) VALUES
(4, 42.8322, NULL, 62.3966, 39.6161, 46.9272, 32.9787, 3, '2026-03-27 11:52:56.789095', 6, '2026-03-27 11:52:56.705780', 1, '76abc2c1-6718-4774-94e7-9cafc8b26512_recording-1774612375823.webm', '/api/pronunciation/audio/76abc2c1-6718-4774-94e7-9cafc8b26512_recording-1774612375823.webm', 'Practice regularly!', 'Fair. Focus on fluency and clarity.', 'COMPLETED'),
(2, 18.0246, NULL, 32.2346, 69.1936, 58.1921, 38.7629, 1, '2026-03-27 12:07:55.275039', 7, '2026-03-27 12:07:55.167983', 1, '7e0ece44-d98d-4cce-a870-5bfb668f3cbc_recording-1774613274143.webm', '/api/pronunciation/audio/7e0ece44-d98d-4cce-a870-5bfb668f3cbc_recording-1774613274143.webm', 'Practice regularly!', 'Fair. Focus on fluency and clarity.', 'COMPLETED'),
(1, 59.3325, NULL, 80.7169, 63.9556, 48.8069, 33.4877, 2, '2026-03-27 12:40:40.010178', 8, '2026-03-27 12:40:39.860994', 1, 'aff98d0c-bd82-485c-a0a7-1e0887f26514_recording-1774615238623.webm', '/api/pronunciation/audio/aff98d0c-bd82-485c-a0a7-1e0887f26514_recording-1774615238623.webm', 'Practice regularly!', 'Fair. Focus on fluency and clarity.', 'COMPLETED'),
(2, 0, NULL, 0, 0, 65, 0, 2, NULL, 9, '2026-03-27 12:48:01.946082', 1, '3505f550-d90a-42d9-9e38-c993fbd6d5ae_recording-1774615678910.webm', '/api/pronunciation/audio/3505f550-d90a-42d9-9e38-c993fbd6d5ae_recording-1774615678910.webm', NULL, 'Analysis service temporarily unavailable.', 'COMPLETED'),
(3, 0, NULL, 0, 0, 0, 0, 2, NULL, 10, '2026-03-27 12:55:10.209260', 1, '682bcac0-a543-4f0f-828d-77524a0b35c5_recording-1774616109076.webm', '/api/pronunciation/audio/682bcac0-a543-4f0f-828d-77524a0b35c5_recording-1774616109076.webm', NULL, NULL, 'PROCESSING'),
(4, 75, NULL, 72, 70, 68.5, 68.5, 2, '2026-03-27 12:58:58.341516', 11, '2026-03-27 12:58:57.843631', 1, '77cbeaf2-db36-407a-98b0-0b0f82105a90_recording-1774616334586.webm', '/api/pronunciation/audio/77cbeaf2-db36-407a-98b0-0b0f82105a90_recording-1774616334586.webm', 'Speak more slowly; Focus on clear vowel sounds; Practice \'th\' sounds', 'Good attempt! Keep practicing pronunciation.', 'COMPLETED'),
(5, 75, NULL, 72, 70, 68.5, 68.5, 2, '2026-03-27 13:03:56.063518', 12, '2026-03-27 13:03:55.641730', 1, 'd8527b3f-ba74-475a-8835-0cd59dc34a71_recording-1774616634753.webm', '/api/pronunciation/audio/d8527b3f-ba74-475a-8835-0cd59dc34a71_recording-1774616634753.webm', 'Speak more slowly; Focus on clear vowel sounds; Practice \'th\' sounds', 'Good attempt! Keep practicing pronunciation.', 'COMPLETED'),
(6, 75, NULL, 72, 70, 68.5, 68.5, 2, '2026-03-27 13:05:56.722703', 13, '2026-03-27 13:05:56.601416', 1, 'e77371af-17d7-4757-a746-4b3cafe1cce9_recording-1774616754559.webm', '/api/pronunciation/audio/e77371af-17d7-4757-a746-4b3cafe1cce9_recording-1774616754559.webm', 'Speak more slowly; Focus on clear vowel sounds; Practice \'th\' sounds', 'Good attempt! Keep practicing pronunciation.', 'COMPLETED'),
(7, 75, NULL, 70, 72, 68, 68, 2, '2026-03-27 13:10:25.429619', 14, '2026-03-27 13:10:25.036405', 1, 'c53b87a6-a530-41d4-9e3d-a96441734ed3_recording-1774617023721.webm', '/api/pronunciation/audio/c53b87a6-a530-41d4-9e3d-a96441734ed3_recording-1774617023721.webm', 'Speak more clearly; Practice difficult sounds', 'Good attempt! The analysis service had a temporary issue.', 'COMPLETED'),
(8, 75, NULL, 70, 72, 68, 68, 2, '2026-03-27 13:13:56.328844', 15, '2026-03-27 13:13:54.405736', 1, 'cf9e7f6b-5191-4a3e-b428-42659b515fb0_recording-1774617233316.webm', '/api/pronunciation/audio/cf9e7f6b-5191-4a3e-b428-42659b515fb0_recording-1774617233316.webm', 'Speak more clearly; Practice difficult sounds', 'Good attempt! The analysis service had a temporary issue.', 'COMPLETED'),
(9, 98, NULL, 93, 97.3, 96, 96, 2, '2026-03-27 13:18:48.726389', 16, '2026-03-27 13:18:47.354136', 1, '3bca0fe1-f8df-480f-9654-a85d4cb6ceac_recording-1774617524646.webm', '/api/pronunciation/audio/3bca0fe1-f8df-480f-9654-a85d4cb6ceac_recording-1774617524646.webm', 'Speak more slowly and clearly; Focus on word stress and rhythm; Practice difficult sounds', 'Excellent pronunciation! Very close to native.', 'COMPLETED'),
(10, 57, NULL, 65, 62, 45, 45, 2, '2026-03-27 13:23:16.560132', 17, '2026-03-27 13:23:12.766073', 1, 'f0b67a9b-414a-4600-a474-77318fa95d47_recording-1774617790713.webm', '/api/pronunciation/audio/f0b67a9b-414a-4600-a474-77318fa95d47_recording-1774617790713.webm', 'Speak more slowly and clearly; Focus on word stress and rhythm; Practice difficult sounds like \'th\' and vowels', 'Fair attempt. Keep practicing pronunciation and clarity.', 'COMPLETED'),
(11, 57, NULL, 50, 49.1, 45, 45, 2, '2026-03-27 13:24:11.984512', 18, '2026-03-27 13:23:57.343266', 1, '2b65a6be-bd75-40a8-abe4-55ad8695dbf8_recording-1774617836111.webm', '/api/pronunciation/audio/2b65a6be-bd75-40a8-abe4-55ad8695dbf8_recording-1774617836111.webm', 'Speak more slowly and clearly; Focus on word stress and rhythm; Practice difficult sounds like \'th\' and vowels', 'Fair attempt. Keep practicing pronunciation and clarity.', 'COMPLETED'),
(12, 75, NULL, 70, 72, 68, 68, 2, '2026-03-27 13:26:32.916271', 19, '2026-03-27 13:26:15.876868', 1, 'b96e62d2-844a-4b19-95b2-486d7854eb96_recording-1774617974162.webm', '/api/pronunciation/audio/b96e62d2-844a-4b19-95b2-486d7854eb96_recording-1774617974162.webm', 'Speak more clearly; Practice difficult sounds', 'Good attempt! The analysis service had a temporary issue.', 'COMPLETED');

-- --------------------------------------------------------

--
-- Structure de la table `user_weak_phonemes`
--

DROP TABLE IF EXISTS `user_weak_phonemes`;
CREATE TABLE IF NOT EXISTS `user_weak_phonemes` (
  `user_progress_id` bigint(20) NOT NULL,
  `phoneme` varchar(255) DEFAULT NULL,
  KEY `FKdkkpat2ja3wjfwddde7xcrqba` (`user_progress_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `challenge_keywords`
--
ALTER TABLE `challenge_keywords`
  ADD CONSTRAINT `FK5ug59j5v0qkcrfpehfdqmwtp6` FOREIGN KEY (`challenge_id`) REFERENCES `pronunciation_challenges` (`id`);

--
-- Contraintes pour la table `phoneme_examples`
--
ALTER TABLE `phoneme_examples`
  ADD CONSTRAINT `FKda1et9met66d4crndjhev20ma` FOREIGN KEY (`phoneme_id`) REFERENCES `phoneme_library` (`id`);

--
-- Contraintes pour la table `recording_problematic_phonemes`
--
ALTER TABLE `recording_problematic_phonemes`
  ADD CONSTRAINT `FKby67s0dk2sv1ytfrw4jq51kqw` FOREIGN KEY (`recording_id`) REFERENCES `user_recordings` (`id`);

--
-- Contraintes pour la table `user_earned_badges`
--
ALTER TABLE `user_earned_badges`
  ADD CONSTRAINT `FKll3sxcks4oehy8h6wsn91u2uk` FOREIGN KEY (`user_progress_id`) REFERENCES `user_progress` (`id`);

--
-- Contraintes pour la table `user_recordings`
--
ALTER TABLE `user_recordings`
  ADD CONSTRAINT `FKfcyaocei09xlp93xruq8iwbo6` FOREIGN KEY (`challenge_id`) REFERENCES `pronunciation_challenges` (`id`);

--
-- Contraintes pour la table `user_weak_phonemes`
--
ALTER TABLE `user_weak_phonemes`
  ADD CONSTRAINT `FKdkkpat2ja3wjfwddde7xcrqba` FOREIGN KEY (`user_progress_id`) REFERENCES `user_progress` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
