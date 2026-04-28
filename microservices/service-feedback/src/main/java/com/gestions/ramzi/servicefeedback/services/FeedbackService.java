package com.gestions.ramzi.servicefeedback.services;

import com.gestions.ramzi.servicefeedback.dto.CoursNoteDTO;
import com.gestions.ramzi.servicefeedback.dto.FeedbackResponse;
import com.gestions.ramzi.servicefeedback.dto.FeedbackStats;
import com.gestions.ramzi.servicefeedback.dto.SentimentStatsDTO;
import com.gestions.ramzi.servicefeedback.dto.StudentFeedbackStatsDTO;
import com.gestions.ramzi.servicefeedback.dto.UserDTO;
import com.gestions.ramzi.servicefeedback.entities.Feedback;
import com.gestions.ramzi.servicefeedback.entities.Sentiment;
import com.gestions.ramzi.servicefeedback.repositories.FeedbackRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    private final FeedbackRepository repository;
    private final SentimentAnalysisService sentimentService;
    private final UserService userService;

    public FeedbackService(FeedbackRepository repository, 
                          SentimentAnalysisService sentimentService,
                          UserService userService) {
        this.repository = repository;
        this.sentimentService = sentimentService;
        this.userService = userService;
    }

    public List<Feedback> getAll() {
        return repository.findAll();
    }

    public Feedback getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Feedback create(Feedback feedback) {
        feedback.setDate(LocalDateTime.now());
        // Analyse automatique du sentiment (avec commentaire et note)
        feedback.setSentiment(sentimentService.analyzeWithNote(feedback.getCommentaire(), feedback.getNote()));
        return repository.save(feedback);
    }

    public Feedback update(Long id, Feedback updated) {
        Feedback existing = getById(id);
        if (existing != null) {
            existing.setNote(updated.getNote());
            existing.setCommentaire(updated.getCommentaire());
            // Recalculer le sentiment lors de la mise à jour (avec commentaire et note)
            existing.setSentiment(sentimentService.analyzeWithNote(updated.getCommentaire(), updated.getNote()));
            return repository.save(existing);
        }
        return null;
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public List<Feedback> getByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    public List<Feedback> getByModuleId(Long moduleId) {
        return repository.findByModuleId(moduleId);
    }

    /**
     * Get all feedbacks with user information (via Feign Client)
     * This is the key integration method!
     */
    public List<FeedbackResponse> getAllWithUserInfo() {
        List<Feedback> feedbacks = repository.findAll();
        List<FeedbackResponse> responses = new ArrayList<>();
        
        for (Feedback feedback : feedbacks) {
            // Utiliser le constructeur au lieu du builder
            FeedbackResponse response = new FeedbackResponse(
                feedback.getId(),
                feedback.getUserId(),
                feedback.getModuleId(),
                feedback.getNote(),
                feedback.getCommentaire(),
                feedback.getDate(),
                feedback.getSentiment(),
                null
            );
            
            // Récupérer les informations de l'utilisateur via Feign Client
            if (feedback.getUserId() != null) {
                try {
                    UserDTO user = userService.getUserById(feedback.getUserId());
                    response.setUser(user);
                } catch (Exception e) {
                    // En cas d'erreur, on continue sans les infos utilisateur
                }
            }
            
            responses.add(response);
        }
        
        return responses;
    }

    /**
     * Get feedback by ID with user information
     */
    public FeedbackResponse getByIdWithUserInfo(Long id) {
        Feedback feedback = getById(id);
        if (feedback == null) {
            return null;
        }
        
        // Utiliser le constructeur au lieu du builder
        FeedbackResponse response = new FeedbackResponse(
            feedback.getId(),
            feedback.getUserId(),
            feedback.getModuleId(),
            feedback.getNote(),
            feedback.getCommentaire(),
            feedback.getDate(),
            feedback.getSentiment(),
            null
        );
        
        // Récupérer les informations de l'utilisateur via Feign Client
        if (feedback.getUserId() != null) {
            try {
                UserDTO user = userService.getUserById(feedback.getUserId());
                response.setUser(user);
            } catch (Exception e) {
                // En cas d'erreur, on continue sans les infos utilisateur
            }
        }
        
        return response;
    }

    /**
     * Get feedback statistics
     * @param moduleId optional module filter
     * @return FeedbackStats object with all statistics
     */
    public FeedbackStats getStats(Long moduleId) {
        List<Feedback> feedbacks;
        
        if (moduleId != null) {
            feedbacks = repository.findByModuleId(moduleId);
        } else {
            feedbacks = repository.findAll();
        }

        if (feedbacks.isEmpty()) {
            return FeedbackStats.builder()
                    .moyenneNote(0.0)
                    .totalFeedbacks(0)
                    .repartitionNotes(new HashMap<>())
                    .feedbacksParMois(new HashMap<>())
                    .nouveauxAujourdhui(0L)
                    .moduleId(moduleId)
                    .build();
        }

        // Calculate average note
        double moyenne = feedbacks.stream()
                .mapToInt(Feedback::getNote)
                .average()
                .orElse(0.0);

        // Calculate note distribution (count per note 1-5)
        Map<Integer, Long> repartitionNotes = feedbacks.stream()
                .collect(Collectors.groupingBy(Feedback::getNote, Collectors.counting()));

        // Ensure all notes 1-5 are present
        for (int i = 1; i <= 5; i++) {
            repartitionNotes.putIfAbsent(i, 0L);
        }

        // Calculate feedbacks per month (last 6 months)
        Map<String, Long> feedbacksParMois = feedbacks.stream()
                .filter(f -> f.getDate() != null)
                .filter(f -> f.getDate().isAfter(LocalDateTime.now().minusMonths(6)))
                .collect(Collectors.groupingBy(
                        f -> f.getDate().format(DateTimeFormatter.ofPattern("yyyy-MM")),
                        Collectors.counting()
                ));

        // Count new feedbacks today
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        long nouveauxAujourdhui = feedbacks.stream()
                .filter(f -> f.getDate() != null)
                .filter(f -> f.getDate().isAfter(todayStart))
                .count();

        return FeedbackStats.builder()
                .moyenneNote(Math.round(moyenne * 100.0) / 100.0)
                .totalFeedbacks(feedbacks.size())
                .repartitionNotes(repartitionNotes)
                .feedbacksParMois(feedbacksParMois)
                .nouveauxAujourdhui(nouveauxAujourdhui)
                .moduleId(moduleId)
                .build();
    }

    /**
     * Get sentiment statistics for all feedbacks
     * @return SentimentStatsDTO with sentiment analysis
     */
    public SentimentStatsDTO getSentimentStats() {
        List<Feedback> feedbacks = repository.findAll();

        if (feedbacks.isEmpty()) {
            return SentimentStatsDTO.builder()
                    .totalPositifs(0)
                    .totalNegatifs(0)
                    .totalNeutres(0)
                    .totalFeedbacks(0)
                    .pourcentagePositifs(0.0)
                    .pourcentageNegatifs(0.0)
                    .pourcentageNeutres(0.0)
                    .repartitionParSentiment(new HashMap<>())
                    .evolutionSentimentParMois(new HashMap<>())
                    .motsNegatifsFrequents(new HashMap<>())
                    .build();
        }

        // Count sentiments
        long totalPositifs = feedbacks.stream()
                .filter(f -> f.getSentiment() == Sentiment.POSITIF)
                .count();
        long totalNegatifs = feedbacks.stream()
                .filter(f -> f.getSentiment() == Sentiment.NEGATIF)
                .count();
        long totalNeutres = feedbacks.stream()
                .filter(f -> f.getSentiment() == null || f.getSentiment() == Sentiment.NEUTRE)
                .count();

        long total = feedbacks.size();

        // Calculate percentages
        double pourcentagePositifs = total > 0 ? (totalPositifs * 100.0 / total) : 0.0;
        double pourcentageNegatifs = total > 0 ? (totalNegatifs * 100.0 / total) : 0.0;
        double pourcentageNeutres = total > 0 ? (totalNeutres * 100.0 / total) : 0.0;

        // Repartition by sentiment
        Map<String, Long> repartitionParSentiment = new HashMap<>();
        repartitionParSentiment.put("POSITIF", totalPositifs);
        repartitionParSentiment.put("NEGATIF", totalNegatifs);
        repartitionParSentiment.put("NEUTRE", totalNeutres);

        // Evolution by month (last 6 months)
        Map<String, Long> evolutionSentimentParMois = feedbacks.stream()
                .filter(f -> f.getDate() != null)
                .filter(f -> f.getDate().isAfter(LocalDateTime.now().minusMonths(6)))
                .collect(Collectors.groupingBy(
                        f -> f.getDate().format(DateTimeFormatter.ofPattern("yyyy-MM")) + "-" + 
                             (f.getSentiment() != null ? f.getSentiment().name() : "NEUTRE"),
                        Collectors.counting()
                ));

        // Extract most common negative words from negative feedbacks
        Map<String, Long> motsNegatifsFrequents = extractNegativeWords(feedbacks);

        return SentimentStatsDTO.builder()
                .totalPositifs(totalPositifs)
                .totalNegatifs(totalNegatifs)
                .totalNeutres(totalNeutres)
                .totalFeedbacks(total)
                .pourcentagePositifs(Math.round(pourcentagePositifs * 100.0) / 100.0)
                .pourcentageNegatifs(Math.round(pourcentageNegatifs * 100.0) / 100.0)
                .pourcentageNeutres(Math.round(pourcentageNeutres * 100.0) / 100.0)
                .repartitionParSentiment(repartitionParSentiment)
                .evolutionSentimentParMois(evolutionSentimentParMois)
                .motsNegatifsFrequents(motsNegatifsFrequents)
                .build();
    }

    /**
     * Get student feedback statistics for dashboard
     * @param userId the student ID
     * @return StudentFeedbackStatsDTO with personal statistics
     */
    public StudentFeedbackStatsDTO getStudentFeedbackStats(Long userId) {
        List<Feedback> feedbacks = repository.findByUserId(userId);
        
        if (feedbacks.isEmpty()) {
            return new StudentFeedbackStatsDTO(userId, 0L, 0.0, new HashMap<>(), new HashMap<>());
        }
        
        // Calculate average note
        double moyenne = feedbacks.stream()
                .mapToInt(Feedback::getNote)
                .average()
                .orElse(0.0);
        
        // Count by sentiment
        Map<String, Long> feedbacksParSentiment = feedbacks.stream()
                .collect(Collectors.groupingBy(
                        f -> f.getSentiment() != null ? f.getSentiment().name() : "NEUTRE",
                        Collectors.counting()
                ));
        
        // Group by module/course
        Map<Long, CoursNoteDTO> feedbacksParCours = feedbacks.stream()
                .collect(Collectors.groupingBy(
                        Feedback::getModuleId,
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                list -> {
                                    double avgNote = list.stream()
                                            .mapToInt(Feedback::getNote)
                                            .average()
                                            .orElse(0.0);
                                    String lastSentiment = list.stream()
                                            .reduce((first, second) -> second)
                                            .map(f -> f.getSentiment() != null ? f.getSentiment().name() : "NEUTRE")
                                            .orElse("NEUTRE");
                                    return new CoursNoteDTO(
                                            list.get(0).getModuleId(),
                                            "Cours " + list.get(0).getModuleId(),
                                            Math.round(avgNote * 100.0) / 100.0,
                                            list.size(),
                                            lastSentiment
                                    );
                                }
                        )
                ));
        
        return new StudentFeedbackStatsDTO(
                userId,
                (long) feedbacks.size(),
                Math.round(moyenne * 100.0) / 100.0,
                feedbacksParSentiment,
                feedbacksParCours
        );
    }

    /**
     * Extract most common negative words from negative feedbacks
     */
    private Map<String, Long> extractNegativeWords(List<Feedback> feedbacks) {
        // Common negative words to look for
        List<String> negativeKeywords = Arrays.asList(
                "mauvais", "terrible", "horrible", "nul", "décevant", "déçu",
                "catastrophe", "pire", "inutile", "problème", "erreur", "bug",
                "bad", "terrible", "horrible", "worst", "poor", "disappointed",
                "hate", "useless", "boring", "confusing", "frustrating"
        );

        Map<String, Long> wordCount = new HashMap<>();

        feedbacks.stream()
                .filter(f -> f.getSentiment() == Sentiment.NEGATIF)
                .filter(f -> f.getCommentaire() != null && !f.getCommentaire().isBlank())
                .forEach(f -> {
                    String lowerComment = f.getCommentaire().toLowerCase();
                    for (String word : negativeKeywords) {
                        if (lowerComment.contains(word)) {
                            wordCount.merge(word, 1L, Long::sum);
                        }
                    }
                });

        // Return top 5 most common negative words
        return wordCount.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new
                ));
    }
}

