package com.elearning.quizbadge.service;

import com.elearning.quizbadge.dto.*;
import com.elearning.quizbadge.entity.*;
import com.elearning.quizbadge.exception.ResourceNotFoundException;
import com.elearning.quizbadge.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuizAdvancedService {

    // Tolérance serveur (secondes) pour absorber les petits décalages réseau/horloge.
    private static final int TIME_BUFFER_SEC = 2;

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizSessionRepository quizSessionRepository;
    private final QuizAnswerRepository quizAnswerRepository;
    private final ObjectMapper objectMapper;

    /**
     * Vérifie si l'étudiant a le droit de démarrer le quiz.
     * Règles métier :
     *  - maxAttempts
     *  - délai minimum entre deux tentatives
     */
    @Transactional(readOnly = true)
    public QuizEligibilityResponse checkEligibility(Long quizId, Long studentId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + quizId));

        int attemptsUsed = (int) quizSessionRepository.countByStudentIdAndQuizIdAndStatusInAndSubmittedAtBetween(
                studentId,
                quizId,
                List.of(QuizSession.SessionStatus.COMPLETED, QuizSession.SessionStatus.ABANDONED),
                LocalDateTime.of(1970, 1, 1, 0, 0),
                LocalDateTime.now().plusYears(100)
        );

        if (quiz.getMaxAttempts() != null && attemptsUsed >= quiz.getMaxAttempts()) {
            return QuizEligibilityResponse.builder()
                    .allowed(false)
                    .message("Nombre maximum de tentatives atteint.")
                    .attemptsUsed(attemptsUsed)
                    .maxAttempts(quiz.getMaxAttempts())
                    .timeLimitSeconds(quiz.getTimeLimitSeconds())
                    .minDelayMinutesBetweenAttempts(quiz.getMinDelayMinutesBetweenAttempts())
                    .build();
        }

        if (quiz.getMinDelayMinutesBetweenAttempts() != null && quiz.getMinDelayMinutesBetweenAttempts() > 0) {
            Optional<QuizSession> lastSession = quizSessionRepository
                    .findFirstByStudentIdAndQuizIdAndStatusInOrderBySubmittedAtDesc(
                            studentId,
                            quizId,
                            List.of(QuizSession.SessionStatus.COMPLETED, QuizSession.SessionStatus.ABANDONED)
                    );
            if (lastSession.isPresent() && lastSession.get().getSubmittedAt() != null) {
                long elapsedMinutes = ChronoUnit.MINUTES.between(lastSession.get().getSubmittedAt(), LocalDateTime.now());
                if (elapsedMinutes < quiz.getMinDelayMinutesBetweenAttempts()) {
                    long waitLeft = quiz.getMinDelayMinutesBetweenAttempts() - elapsedMinutes;
                    return QuizEligibilityResponse.builder()
                            .allowed(false)
                            .message("Veuillez attendre " + waitLeft + " minute(s) avant une nouvelle tentative.")
                            .attemptsUsed(attemptsUsed)
                            .maxAttempts(quiz.getMaxAttempts())
                            .timeLimitSeconds(quiz.getTimeLimitSeconds())
                            .minDelayMinutesBetweenAttempts(quiz.getMinDelayMinutesBetweenAttempts())
                            .build();
                }
            }
        }

        return QuizEligibilityResponse.builder()
                .allowed(true)
                .message("Quiz disponible.")
                .attemptsUsed(attemptsUsed)
                .maxAttempts(quiz.getMaxAttempts())
                .timeLimitSeconds(quiz.getTimeLimitSeconds())
                .minDelayMinutesBetweenAttempts(quiz.getMinDelayMinutesBetweenAttempts())
                .lessonsDone(null)
                .lessonsTotal(null)
                .build();
    }

    /**
     * Démarre une session de quiz ou reprend la session IN_PROGRESS la plus récente.
     * Le frontend peut donc recharger la page sans perdre l'état courant.
     */
    @Transactional
    public QuizSessionStartResponse startOrResume(QuizSessionStartRequest request) {
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + request.getQuizId()));

        // Même barrière que l’endpoint GET eligibility : tentatives max, délai entre deux essais, etc.
        QuizEligibilityResponse eligibility = checkEligibility(request.getQuizId(), request.getStudentId());
        if (!eligibility.isAllowed()) {
            throw new IllegalStateException(eligibility.getMessage());
        }

        // Une seule session « ouverte » à la fois : la plus récente par date de démarrage.
        Optional<QuizSession> existing = quizSessionRepository
                .findFirstByStudentIdAndQuizIdAndStatusOrderByStartedAtDesc(
                        request.getStudentId(),
                        request.getQuizId(),
                        QuizSession.SessionStatus.IN_PROGRESS
                );

        if (existing.isPresent()) {
            return toStartResponse(existing.get(), quiz);
        }

        // Première ouverture de cette tentative : état initial côté BDD avant toute saisie côté client.
        QuizSession created = QuizSession.builder()
                .studentId(request.getStudentId())
                .quizId(request.getQuizId())
                .status(QuizSession.SessionStatus.IN_PROGRESS)
                .durationSeconds(0)
                .currentStep(0)
                .answersJson("[]")
                // Rapportés ensuite par le client (onglet masqué / actions copier-coller bloquées) ; ici point de départ.
                .tabHiddenCount(0)
                .clipboardBlockCount(0)
                .build();

        created = quizSessionRepository.save(created);
        return toStartResponse(created, quiz);
    }

    /**
     * Sauvegarde progressive (autosave) de l'avancement quiz :
     *  - step courant
     *  - durée cumulée
     *  - snapshot des réponses (answersJson)
     */
    @Transactional
    public void saveProgress(Long sessionId, QuizSessionSaveRequest request) {
        QuizSession session = quizSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));

        if (session.getStatus() != QuizSession.SessionStatus.IN_PROGRESS) {
            throw new IllegalStateException("Session déjà terminée.");
        }
        if (!Objects.equals(session.getStudentId(), request.getStudentId())
                || !Objects.equals(session.getQuizId(), request.getQuizId())) {
            throw new IllegalStateException("Session invalide pour cet étudiant/quiz.");
        }

        session.setDurationSeconds(Math.max(0, request.getDurationSeconds() == null ? 0 : request.getDurationSeconds()));
        session.setCurrentStep(Math.max(0, request.getCurrentStep() == null ? 0 : request.getCurrentStep()));
        session.setAnswersJson(serializeAnswers(request.getAnswers()));
        mergeIntegrityCounts(session, request.getTabHiddenCount(), request.getClipboardBlockCount());
        session.setLastError(null);
        quizSessionRepository.save(session);
    }

    /**
     * Enregistre un événement de proctoring caméra (signalement client : téléphone, plusieurs personnes, coupure flux).
     */
    @Transactional
    public void recordProctoringEvent(Long sessionId, ProctoringEventRequest request) {
        QuizSession session = quizSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));

        if (session.getStatus() != QuizSession.SessionStatus.IN_PROGRESS) {
            throw new IllegalStateException("Session déjà terminée.");
        }
        if (!Objects.equals(session.getStudentId(), request.getStudentId())
                || !Objects.equals(session.getQuizId(), request.getQuizId())) {
            throw new IllegalStateException("Session invalide pour cet étudiant/quiz.");
        }

        String type = request.getEventType() == null ? "" : request.getEventType().trim();
        String detail = request.getDetail() == null ? null : request.getDetail().trim();
        if (detail != null && detail.length() > 500) {
            detail = detail.substring(0, 500);
        }

        LocalDateTime now = LocalDateTime.now();
        session.setProctoringLastEvent(type);
        session.setProctoringLastEventAt(now);

        switch (type) {
            case ProctoringEventRequest.PHONE_DETECTED -> session.setProctoringPhoneCount(
                    Optional.ofNullable(session.getProctoringPhoneCount()).orElse(0) + 1);
            case ProctoringEventRequest.MULTIPLE_PERSON_DETECTED -> session.setProctoringMultiPersonCount(
                    Optional.ofNullable(session.getProctoringMultiPersonCount()).orElse(0) + 1);
            case ProctoringEventRequest.CAMERA_INTERRUPTED -> session.setProctoringCameraLostCount(
                    Optional.ofNullable(session.getProctoringCameraLostCount()).orElse(0) + 1);
            default -> throw new IllegalArgumentException("eventType inconnu: " + type);
        }

        log.info("Proctoring session={} type={} detail={}", sessionId, type, detail);
        quizSessionRepository.save(session);
    }

    /**
     * Soumission finale :
     *  - contrôle anti double soumission
     *  - validation serveur du temps imparti (TIME_EXPIRED)
     *  - calcul score, points, stats par question
     *  - persistance détaillée dans quiz_answers
     */
    @Transactional
    public QuizSessionSubmitResponse submit(Long sessionId, QuizSessionSubmitRequest request) {
        QuizSession session = quizSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));

        if (session.getStatus() != QuizSession.SessionStatus.IN_PROGRESS) {
            throw new IllegalStateException("DUPLICATE_SUBMIT");
        }
        if (!Objects.equals(session.getStudentId(), request.getStudentId())
                || !Objects.equals(session.getQuizId(), request.getQuizId())) {
            throw new IllegalStateException("Session invalide pour cet étudiant/quiz.");
        }

        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + request.getQuizId()));

        if (quiz.getTimeLimitSeconds() != null && quiz.getTimeLimitSeconds() > 0) {
            long serverElapsed = ChronoUnit.SECONDS.between(session.getStartedAt(), LocalDateTime.now());
            if (serverElapsed > (quiz.getTimeLimitSeconds() + TIME_BUFFER_SEC)) {
                session.setStatus(QuizSession.SessionStatus.ABANDONED);
                session.setLastError("TIME_EXPIRED");
                session.setSubmittedAt(LocalDateTime.now());
                session.setDurationSeconds((int) Math.max(0, serverElapsed));
                quizSessionRepository.save(session);
                throw new IllegalStateException("TIME_EXPIRED");
            }
        }

        // On ne corrige que les questions actives, triées dans l'ordre pédagogique.
        List<QuizQuestion> questions = quizQuestionRepository.findByQuizIdOrderByOrderNumberAscIdAsc(quiz.getId())
                .stream()
                .filter(q -> Boolean.TRUE.equals(q.getIsActive()))
                .toList();
        if (questions.isEmpty()) {
            throw new IllegalStateException("Aucune question active pour ce quiz.");
        }

        List<QuizAnswerPayload> payloadAnswers = Optional.ofNullable(request.getAnswers()).orElse(List.of());
        Map<Long, QuizAnswerPayload> byQuestionId = payloadAnswers.stream()
                .filter(a -> a.getQuestionId() != null)
                .collect(Collectors.toMap(QuizAnswerPayload::getQuestionId, a -> a, (a, b) -> b, LinkedHashMap::new));

        int totalPoints = 0;
        int earnedPoints = 0;
        int correctCount = 0;
        int unansweredCount = 0;
        List<QuizSessionSubmitResponse.PerQuestion> perQuestion = new ArrayList<>();

        for (QuizQuestion q : questions) {
            totalPoints += Optional.ofNullable(q.getPoints()).orElse(0);
            QuizAnswerPayload a = byQuestionId.get(q.getId());
            String answerText = a != null ? safeTrim(a.getAnswerText()) : "";
            boolean unanswered = answerText.isBlank();
            boolean correct = !unanswered && normalize(answerText).equals(normalize(q.getCorrectAnswer()));
            int points = correct ? Optional.ofNullable(q.getPoints()).orElse(0) : 0;

            if (correct) correctCount++;
            if (unanswered) unansweredCount++;
            earnedPoints += points;

            // Upsert logique: une seule ligne par (attemptId, questionId).
            QuizAnswer row = quizAnswerRepository.findByAttemptIdAndQuestionId(session.getId(), q.getId())
                    .orElseGet(() -> QuizAnswer.builder()
                            .attemptId(session.getId())
                            .questionId(q.getId())
                            .build());
            row.setAnswerText(answerText);
            row.setIsCorrect(correct);
            row.setEarnedPoints(points);
            row.setTimeSpentSeconds(Math.max(0, a != null && a.getTimeSpentSeconds() != null ? a.getTimeSpentSeconds() : 0));
            row.setMarkedForReview(a != null && Boolean.TRUE.equals(a.getMarkedForReview()));
            quizAnswerRepository.save(row);

            perQuestion.add(QuizSessionSubmitResponse.PerQuestion.builder()
                    .questionId(q.getId())
                    .correct(correct)
                    .earnedPoints(points)
                    .build());
        }

        int wrongCount = Math.max(0, questions.size() - correctCount - unansweredCount);
        int scorePercent = totalPoints > 0 ? (int) Math.round((earnedPoints * 100.0) / totalPoints) : 0;
        int threshold = Optional.ofNullable(quiz.getPassingScorePercent()).orElse(50);
        int duration = Math.max(
                Optional.ofNullable(request.getDurationSeconds()).orElse(0),
                (int) Math.max(0, ChronoUnit.SECONDS.between(session.getStartedAt(), LocalDateTime.now()))
        );

        mergeIntegrityCounts(session, request.getTabHiddenCount(), request.getClipboardBlockCount());
        session.setStatus(QuizSession.SessionStatus.COMPLETED);
        session.setSubmittedAt(LocalDateTime.now());
        session.setDurationSeconds(duration);
        session.setAnswersJson(serializeAnswers(payloadAnswers));
        session.setLastError(null);
        quizSessionRepository.save(session);

        return QuizSessionSubmitResponse.builder()
                .sessionId(session.getId())
                .scorePercent(scorePercent)
                .pointsEarned(earnedPoints)
                .totalPoints(totalPoints)
                .correctCount(correctCount)
                .wrongCount(wrongCount)
                .unansweredCount(unansweredCount)
                .durationSeconds(duration)
                .passed(scorePercent >= threshold)
                .perQuestion(perQuestion)
                .tabHiddenCount(session.getTabHiddenCount())
                .clipboardBlockCount(session.getClipboardBlockCount())
                .proctoringPhoneCount(Optional.ofNullable(session.getProctoringPhoneCount()).orElse(0))
                .proctoringMultiPersonCount(Optional.ofNullable(session.getProctoringMultiPersonCount()).orElse(0))
                .proctoringCameraLostCount(Optional.ofNullable(session.getProctoringCameraLostCount()).orElse(0))
                .proctoringLastEvent(session.getProctoringLastEvent())
                .build();
    }

    /**
     * Transforme l'entité session en payload de démarrage attendu par le frontend.
     */
    private QuizSessionStartResponse toStartResponse(QuizSession session, Quiz quiz) {
        int remainingSeconds = 0;
        if (quiz.getTimeLimitSeconds() != null && quiz.getTimeLimitSeconds() > 0) {
            long elapsed = Math.max(0, ChronoUnit.SECONDS.between(session.getStartedAt(), LocalDateTime.now()));
            remainingSeconds = (int) Math.max(0, quiz.getTimeLimitSeconds() - elapsed);
        }
        return QuizSessionStartResponse.builder()
                .id(session.getId())
                .attemptId(session.getId().intValue())
                .durationSeconds(Optional.ofNullable(session.getDurationSeconds()).orElse(0))
                .currentStep(Optional.ofNullable(session.getCurrentStep()).orElse(0))
                .answers(parseAnswers(session.getAnswersJson()))
                .timeLimitSeconds(quiz.getTimeLimitSeconds())
                .maxAttempts(quiz.getMaxAttempts())
                .remainingSeconds(quiz.getTimeLimitSeconds() != null ? remainingSeconds : null)
                .tabHiddenCount(Optional.ofNullable(session.getTabHiddenCount()).orElse(0))
                .clipboardBlockCount(Optional.ofNullable(session.getClipboardBlockCount()).orElse(0))
                .proctoringPhoneCount(Optional.ofNullable(session.getProctoringPhoneCount()).orElse(0))
                .proctoringMultiPersonCount(Optional.ofNullable(session.getProctoringMultiPersonCount()).orElse(0))
                .proctoringCameraLostCount(Optional.ofNullable(session.getProctoringCameraLostCount()).orElse(0))
                .proctoringLastEvent(session.getProctoringLastEvent())
                .build();
    }

    /**
     * Fusionne les compteurs d’intégrité : le serveur garde le max (évite de baisser artificiellement).
     */
    private static void mergeIntegrityCounts(QuizSession session, Integer tabHidden, Integer clipboardBlocks) {
        if (tabHidden != null && tabHidden >= 0) {
            int prev = Optional.ofNullable(session.getTabHiddenCount()).orElse(0);
            session.setTabHiddenCount(Math.max(prev, tabHidden));
        }
        if (clipboardBlocks != null && clipboardBlocks >= 0) {
            int prev = Optional.ofNullable(session.getClipboardBlockCount()).orElse(0);
            session.setClipboardBlockCount(Math.max(prev, clipboardBlocks));
        }
    }

    // Helpers sérialisation / normalisation.
    private List<QuizAnswerPayload> parseAnswers(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<List<QuizAnswerPayload>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    private String serializeAnswers(List<QuizAnswerPayload> answers) {
        try {
            return objectMapper.writeValueAsString(Optional.ofNullable(answers).orElse(List.of()));
        } catch (Exception e) {
            return "[]";
        }
    }

    private String normalize(String v) {
        return safeTrim(v).toLowerCase(Locale.ROOT);
    }

    private String safeTrim(String v) {
        return v == null ? "" : v.trim();
    }
}
