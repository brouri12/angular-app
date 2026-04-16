package tn.esprit.challenge.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.challenge.entity.Challenge;
import tn.esprit.challenge.entity.Question;
import tn.esprit.challenge.enums.ChallengeType;
import tn.esprit.challenge.enums.ProficiencyLevel;
import tn.esprit.challenge.enums.QuestionType;
import tn.esprit.challenge.enums.SkillFocus;
import tn.esprit.challenge.repository.ChallengeRepository;
import tn.esprit.challenge.repository.QuestionRepository;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

/**
 * Scheduler that automatically creates a new "Challenge of the Week"
 * every Monday at 08:00 AM (server time).
 *
 * Cron expression: "0 0 8 * * MON"
 *   ┌─ second (0)
 *   │ ┌─ minute (0)
 *   │ │ ┌─ hour (8)
 *   │ │ │ ┌─ day-of-month (*)
 *   │ │ │ │ ┌─ month (*)
 *   │ │ │ │ │ ┌─ day-of-week (MON)
 *   0 0 8 * * MON
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WeeklyChallengeScheduler {

    private final ChallengeRepository challengeRepository;
    private final QuestionRepository questionRepository;

    private final Random random = new Random();

    // ── Cron: every Monday at 08:00:00 ────────────────────────────────────────
    @Scheduled(cron = "0 0 8 * * MON")
    @Transactional
    public void createWeeklyChallenge() {
        log.info("⏰ [WeeklyChallengeScheduler] Monday 08:00 — generating Challenge of the Week...");

        try {
            Challenge challenge = buildWeeklyChallenge();
            Challenge saved = challengeRepository.save(challenge);

            List<Question> questions = buildQuestionsFor(saved);
            questionRepository.saveAll(questions);

            log.info("✅ [WeeklyChallengeScheduler] Created '{}' (id={}) with {} questions",
                    saved.getTitle(), saved.getId(), questions.size());

        } catch (Exception e) {
            log.error("❌ [WeeklyChallengeScheduler] Failed to create weekly challenge: {}", e.getMessage(), e);
        }
    }

    // ── Challenge builder ──────────────────────────────────────────────────────

    private Challenge buildWeeklyChallenge() {
        // Rotate through types and levels so each week feels different
        ChallengeType type   = pickType();
        ProficiencyLevel lvl = pickLevel();
        SkillFocus skill     = skillFor(type);

        String week = LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

        Challenge c = new Challenge();
        c.setTitle(titleFor(type, lvl, week));
        c.setDescription(descriptionFor(type, lvl));
        c.setType(type);
        c.setSkillFocus(skill);
        c.setLevel(lvl);
        c.setCategory(categoryFor(type));
        c.setPoints(pointsFor(lvl));
        c.setTimeLimit(15);          // 15-minute weekly challenge
        c.setContent(contentFor(type));
        c.setIsPublic(true);
        c.setTags("weekly,auto-generated," + type.name().toLowerCase() + "," + lvl.name().toLowerCase());
        c.setCreatedBy(0L);          // 0 = system / scheduler
        c.setTotalAttempts(0);
        c.setSuccessfulCompletions(0);
        c.setAverageRating(0.0);
        return c;
    }

    // ── Question builder ───────────────────────────────────────────────────────

    private List<Question> buildQuestionsFor(Challenge challenge) {
        return switch (challenge.getType()) {
            case VOCABULARY -> buildVocabularyQuestions(challenge);
            case GRAMMAR    -> buildGrammarQuestions(challenge);
            case IDIOMS     -> buildIdiomsQuestions(challenge);
            case READING    -> buildReadingQuestions(challenge);
            default         -> buildMixedQuestions(challenge);
        };
    }

    // ── VOCABULARY questions ───────────────────────────────────────────────────

    private List<Question> buildVocabularyQuestions(Challenge challenge) {
        return List.of(
            mcq(challenge, 0,
                "What does 'eloquent' mean?",
                List.of("Well-spoken and expressive", "Shy and reserved", "Loud and aggressive", "Confused and unclear"),
                "Well-spoken and expressive",
                "Eloquent means fluent or persuasive in speaking or writing."),

            mcq(challenge, 1,
                "Choose the correct synonym for 'benevolent'.",
                List.of("Kind and generous", "Cruel and harsh", "Lazy and indifferent", "Strict and demanding"),
                "Kind and generous",
                "Benevolent means well-meaning and kindly."),

            mcq(challenge, 2,
                "What is the antonym of 'abundant'?",
                List.of("Scarce", "Plentiful", "Excessive", "Sufficient"),
                "Scarce",
                "Abundant means existing in large quantities; its antonym is scarce."),

            fillBlank(challenge, 3,
                "The scientist made a ________ discovery that changed medicine forever. (remarkable/ordinary)",
                "remarkable",
                "Remarkable means worthy of attention; it fits the positive context."),

            trueFalse(challenge, 4,
                "'Diligent' means lazy and careless.",
                "False",
                "Diligent means having or showing care and conscientiousness in one's work.")
        );
    }

    // ── GRAMMAR questions ──────────────────────────────────────────────────────

    private List<Question> buildGrammarQuestions(Challenge challenge) {
        return List.of(
            mcq(challenge, 0,
                "Which sentence is grammatically correct?",
                List.of(
                    "She has been working here since five years.",
                    "She has been working here for five years.",
                    "She is working here since five years.",
                    "She was working here for five years ago."
                ),
                "She has been working here for five years.",
                "Use 'for' with a duration and present perfect continuous for ongoing actions."),

            mcq(challenge, 1,
                "Choose the correct form: 'If I ________ rich, I would travel the world.'",
                List.of("am", "were", "will be", "would be"),
                "were",
                "Second conditional uses 'were' (or 'was' informally) for hypothetical present situations."),

            trueFalse(challenge, 2,
                "The sentence 'Neither the students nor the teacher are ready' is correct.",
                "False",
                "With 'neither...nor', the verb agrees with the subject closest to it: 'the teacher is ready'."),

            fillBlank(challenge, 3,
                "She ________ (finish) her report by the time the meeting starts.",
                "will have finished",
                "Future perfect tense is used for an action completed before a future point."),

            mcq(challenge, 4,
                "Which word correctly completes: 'He is ________ honest man.'",
                List.of("a", "an", "the", "—"),
                "an",
                "Use 'an' before words starting with a vowel sound. 'Honest' starts with a silent H.")
        );
    }

    // ── IDIOMS questions ───────────────────────────────────────────────────────

    private List<Question> buildIdiomsQuestions(Challenge challenge) {
        return List.of(
            mcq(challenge, 0,
                "What does 'break the ice' mean?",
                List.of("Start a conversation in an awkward situation", "Destroy something frozen", "Win a competition", "Cause an argument"),
                "Start a conversation in an awkward situation",
                "Breaking the ice means doing something to relieve tension or start a conversation."),

            mcq(challenge, 1,
                "If someone is 'under the weather', they are:",
                List.of("Feeling ill", "Enjoying the rain", "Very busy", "Extremely happy"),
                "Feeling ill",
                "Under the weather is an idiom meaning slightly unwell."),

            trueFalse(challenge, 2,
                "'Bite the bullet' means to avoid a difficult situation.",
                "False",
                "Bite the bullet means to endure a painful or difficult situation with courage."),

            mcq(challenge, 3,
                "What does 'hit the nail on the head' mean?",
                List.of("Describe exactly what is causing a situation", "Make a mistake", "Work very hard", "Lose your temper"),
                "Describe exactly what is causing a situation",
                "This idiom means to be exactly right about something."),

            fillBlank(challenge, 4,
                "After years of hard work, her success was not a ________ in the sky — it was well deserved. (pie/cake)",
                "pie",
                "'Pie in the sky' means an unrealistic hope or plan.")
        );
    }

    // ── READING questions ──────────────────────────────────────────────────────

    private List<Question> buildReadingQuestions(Challenge challenge) {
        return List.of(
            mcq(challenge, 0,
                "Read: 'Despite the heavy rain, the marathon runners completed the race.' — What does 'despite' indicate?",
                List.of("A contrast between two facts", "A reason for an action", "A result of an event", "A condition"),
                "A contrast between two facts",
                "'Despite' introduces a contrast — the rain did not stop the runners."),

            mcq(challenge, 1,
                "The word 'subsequently' in a text most likely means:",
                List.of("Afterwards", "Previously", "Meanwhile", "Consequently"),
                "Afterwards",
                "Subsequently means after a particular thing has happened; afterwards."),

            trueFalse(challenge, 2,
                "A 'topic sentence' usually appears at the end of a paragraph.",
                "False",
                "A topic sentence typically appears at the beginning of a paragraph to introduce its main idea."),

            mcq(challenge, 3,
                "If a passage says 'the author implies', it means the author:",
                List.of("Suggests something without stating it directly", "States something clearly", "Contradicts the main idea", "Quotes another source"),
                "Suggests something without stating it directly",
                "To imply means to suggest or indicate indirectly."),

            fillBlank(challenge, 4,
                "The main idea of a paragraph is usually found in the ________ sentence.",
                "topic",
                "The topic sentence states the main idea of the paragraph.")
        );
    }

    // ── MIXED questions ────────────────────────────────────────────────────────

    private List<Question> buildMixedQuestions(Challenge challenge) {
        return List.of(
            mcq(challenge, 0,
                "Which sentence uses the present perfect correctly?",
                List.of("I have seen that movie yesterday.", "I have seen that movie.", "I seen that movie.", "I did see that movie already."),
                "I have seen that movie.",
                "Present perfect does not use specific past time expressions like 'yesterday'."),

            mcq(challenge, 1,
                "What does 'meticulous' mean?",
                List.of("Very careful and precise", "Careless and rushed", "Loud and boisterous", "Shy and timid"),
                "Very careful and precise",
                "Meticulous means showing great attention to detail."),

            trueFalse(challenge, 2,
                "The idiom 'spill the beans' means to reveal a secret.",
                "True",
                "Spill the beans means to reveal information that was supposed to be kept secret."),

            fillBlank(challenge, 3,
                "She speaks English so ________ that everyone understands her perfectly. (fluently/fluent)",
                "fluently",
                "An adverb (fluently) is needed to modify the verb 'speaks'."),

            mcq(challenge, 4,
                "Choose the correct passive form: 'Someone stole my wallet.'",
                List.of("My wallet was stolen.", "My wallet is stolen.", "My wallet has steal.", "My wallet stolen."),
                "My wallet was stolen.",
                "Passive voice: subject + was/were + past participle.")
        );
    }

    // ── Question factory helpers ───────────────────────────────────────────────

    private Question mcq(Challenge challenge, int order, String text,
                         List<String> options, String correct, String explanation) {
        Question q = new Question();
        q.setChallenge(challenge);
        q.setType(QuestionType.MULTIPLE_CHOICE);
        q.setQuestionText(text);
        q.setOptions(options);
        q.setCorrectAnswer(correct);
        q.setExplanation(explanation);
        q.setPoints(20);
        q.setOrderIndex(order);
        return q;
    }

    private Question trueFalse(Challenge challenge, int order, String text,
                               String correct, String explanation) {
        Question q = new Question();
        q.setChallenge(challenge);
        q.setType(QuestionType.TRUE_FALSE);
        q.setQuestionText(text);
        q.setOptions(List.of("True", "False"));
        q.setCorrectAnswer(correct);
        q.setExplanation(explanation);
        q.setPoints(20);
        q.setOrderIndex(order);
        return q;
    }

    private Question fillBlank(Challenge challenge, int order, String text,
                               String correct, String explanation) {
        Question q = new Question();
        q.setChallenge(challenge);
        q.setType(QuestionType.FILL_BLANK);
        q.setQuestionText(text);
        q.setCorrectAnswer(correct);
        q.setExplanation(explanation);
        q.setPoints(20);
        q.setOrderIndex(order);
        return q;
    }

    // ── Rotation helpers ───────────────────────────────────────────────────────

    /** Rotate through types based on week number so each week is different */
    private ChallengeType pickType() {
        ChallengeType[] types = {
            ChallengeType.VOCABULARY,
            ChallengeType.GRAMMAR,
            ChallengeType.IDIOMS,
            ChallengeType.READING,
            ChallengeType.MIXED
        };
        int weekOfYear = LocalDate.now().getDayOfYear() / 7;
        return types[weekOfYear % types.length];
    }

    /** Rotate through levels A1 → C1 */
    private ProficiencyLevel pickLevel() {
        ProficiencyLevel[] levels = {
            ProficiencyLevel.A1, ProficiencyLevel.A2,
            ProficiencyLevel.B1, ProficiencyLevel.B2,
            ProficiencyLevel.C1
        };
        int weekOfYear = LocalDate.now().getDayOfYear() / 7;
        return levels[weekOfYear % levels.length];
    }

    private SkillFocus skillFor(ChallengeType type) {
        return switch (type) {
            case VOCABULARY -> SkillFocus.VOCABULARY;
            case GRAMMAR    -> SkillFocus.GRAMMAR;
            case READING    -> SkillFocus.READING;
            case LISTENING  -> SkillFocus.LISTENING;
            case WRITING    -> SkillFocus.WRITING;
            case SPEAKING   -> SkillFocus.SPEAKING;
            default         -> SkillFocus.VOCABULARY;
        };
    }

    private String titleFor(ChallengeType type, ProficiencyLevel lvl, String week) {
        String typeName = switch (type) {
            case VOCABULARY -> "Vocabulary";
            case GRAMMAR    -> "Grammar";
            case IDIOMS     -> "Idioms & Expressions";
            case READING    -> "Reading Comprehension";
            case MIXED      -> "Mixed Skills";
            default         -> type.name();
        };
        return "Weekly Challenge — " + typeName + " [" + lvl.name() + "] — " + week;
    }

    private String descriptionFor(ChallengeType type, ProficiencyLevel lvl) {
        return "This week's auto-generated " + type.name().toLowerCase()
                + " challenge for " + lvl.name() + " learners. "
                + "Complete all 5 questions to earn your weekly points!";
    }

    private String categoryFor(ChallengeType type) {
        return switch (type) {
            case VOCABULARY -> "Word Power";
            case GRAMMAR    -> "Tenses & Structure";
            case IDIOMS     -> "Idioms";
            case READING    -> "Comprehension";
            default         -> "General English";
        };
    }

    private int pointsFor(ProficiencyLevel lvl) {
        return switch (lvl) {
            case A1 -> 50;
            case A2 -> 75;
            case B1 -> 100;
            case B2 -> 125;
            case C1 -> 150;
            case C2 -> 200;
        };
    }

    private String contentFor(ChallengeType type) {
        return switch (type) {
            case READING -> """
                    Read the following passage carefully and answer the questions below.
                    
                    "Language is the road map of a culture. It tells you where its people come from \
                    and where they are going. Learning a new language is not just about memorizing \
                    words and grammar rules — it is about understanding a new way of seeing the world."
                    """;
            case GRAMMAR -> "Apply your grammar knowledge to complete the following exercises correctly.";
            case VOCABULARY -> "Test your vocabulary skills with the following questions.";
            case IDIOMS -> "How well do you know English idioms and expressions? Find out below!";
            default -> "Complete all questions to the best of your ability. Good luck!";
        };
    }
}
