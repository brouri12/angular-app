package com.elearning.quizbadge.service;

import com.elearning.quizbadge.dto.ChatbotRequest;
import com.elearning.quizbadge.dto.ChatbotResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Coach anglais « Jungle English Coach » — même logique métier que le UserService (OpenAI / Hugging Face).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotService {

    private static final String SYSTEM_PROMPT = """
            You are an AI assistant for an e-learning platform focused on English learning.

            STRICT RULES:

            1. Language:
            - You MUST always respond in English only.
            - Even if the user writes in French or Arabic, respond in English.

            2. Allowed topics:
            You can ONLY answer questions about:
            - English language (grammar, vocabulary, pronunciation)
            - Translation to/from English
            - Courses on the platform
            - Lessons and learning content
            - Quizzes and scores
            - Prices and subscriptions
            - Uploaded documents and course materials

            3. Out-of-scope questions:
            If the question is NOT related to English learning or the platform, you MUST refuse.
            Use this exact response:
            "Sorry, I can only answer questions related to English learning and the platform."

            4. Unknown information:
            If the answer is not found in the platform or documents, DO NOT invent.
            Use this response:
            "Sorry, I couldn't find this information in the available resources."

            5. Teaching behavior:
            - Explain English clearly and simply
            - Give examples when needed
            - Keep answers short and helpful

            6. Tone:
            - Professional
            - Clear
            - Student-friendly

            7. Priority:
            - First use course content and uploaded documents
            - Then general English knowledge
            """;

    private static final String OUT_OF_SCOPE_REPLY =
            "Sorry, I can only answer questions related to English learning and the platform.";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${chatbot.openai.api-key:}")
    private String openaiApiKey;
    @Value("${chatbot.openai.url:https://api.openai.com/v1/chat/completions}")
    private String openaiUrl;
    @Value("${chatbot.openai.model:gpt-4o-mini}")
    private String openaiModel;
    @Value("${chatbot.huggingface.api-key:}")
    private String hfApiKey;
    @Value("${chatbot.huggingface.url:https://router.huggingface.co/v1/chat/completions}")
    private String hfUrl;
    @Value("${chatbot.huggingface.model:Qwen/Qwen2.5-7B-Instruct}")
    private String hfModel;

    public ChatbotResponse process(ChatbotRequest request) {
        try {
            if (request == null || request.getMessage() == null) {
                return ChatbotResponse.error("message requis");
            }
            String message = request.getMessage().trim();
            if (message.isEmpty()) {
                return ChatbotResponse.error("message requis");
            }
            if (!isInScope(message)) {
                return ChatbotResponse.success(OUT_OF_SCOPE_REPLY);
            }
            List<ChatbotRequest.ChatMessage> history = request.getHistory() != null ? request.getHistory() : List.of();
            String reply = askEnglishCoachAi(message, history);
            return ChatbotResponse.success(reply);
        } catch (Exception e) {
            log.warn("[Chatbot] Erreur: {}", e.getMessage(), e);
            return ChatbotResponse.error(e.getMessage() != null ? e.getMessage() : "Coach unavailable");
        }
    }

    private boolean isInScope(String text) {
        if (text == null) return false;
        String s = text.toLowerCase(Locale.ROOT).trim();
        if (s.isEmpty()) return false;
        if (s.contains("translate") || s.contains("translation") || s.contains("tradu") || s.contains("traduction")) {
            return true;
        }
        List<String> english = List.of(
                "english", "grammar", "vocabulary", "pronunciation", "spelling", "sentence", "correct",
                "tense", "past", "present", "future", "speaking", "listening", "reading", "writing",
                "exercise", "practice", "quiz", "score"
        );
        if (english.stream().anyMatch(s::contains)) return true;
        List<String> platform = List.of(
                "course", "chapter", "lesson", "material", "document", "upload", "download",
                "subscription", "plan", "price", "payment", "invoice", "receipt",
                "badge", "enrollment", "enroll", "account", "login"
        );
        return platform.stream().anyMatch(s::contains);
    }

    private String askEnglishCoachAi(String message, List<ChatbotRequest.ChatMessage> history) throws Exception {
        String apiKey = openaiApiKey != null && !openaiApiKey.isBlank() ? openaiApiKey : hfApiKey;
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "Aucune clé IA configurée (chatbot.openai.api-key ou chatbot.huggingface.api-key)");
        }
        boolean useOpenAI = openaiApiKey != null && !openaiApiKey.isBlank();
        String url = useOpenAI ? openaiUrl : hfUrl;
        String model = useOpenAI ? openaiModel : hfModel;

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));
        if (history != null) {
            history.stream().limit(10).forEach(h -> {
                if (h != null && h.getContent() != null && !h.getContent().trim().isEmpty()) {
                    String role = "assistant".equals(h.getRole()) ? "assistant" : "user";
                    String c = h.getContent().trim();
                    c = c.substring(0, Math.min(800, c.length()));
                    messages.add(Map.of("role", role, "content", c));
                }
            });
        }
        String userMsg = message.substring(0, Math.min(1500, message.length()));
        messages.add(Map.of("role", "user", "content", userMsg));

        Map<String, Object> payload = new HashMap<>();
        payload.put("model", model);
        payload.put("temperature", 0.4);
        payload.put("messages", messages);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(payload), headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new RuntimeException("API IA non disponible");
        }
        JsonNode root = objectMapper.readTree(response.getBody());
        JsonNode choices = root.path("choices");
        if (choices.isEmpty()) {
            JsonNode err = root.path("error").path("message");
            throw new RuntimeException(err.isMissingNode() ? "Réponse IA invalide" : err.asText());
        }
        String content = choices.get(0).path("message").path("content").asText("").trim();
        if (content.isEmpty()) throw new RuntimeException("Réponse IA vide");
        return content;
    }
}
