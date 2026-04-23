package com.elearning.quizbadge.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

/**
 * Charge {@code chatbot.openai.api-key} / {@code chatbot.huggingface.api-key} si absents du
 * {@code application.properties} : variables d'environnement puis fichiers à la racine du processus.
 * <p>
 * Fichiers cherchés (dans l'ordre) sous {@code user.dir} puis {@code user.dir/quiz-badge-service} :
 * <ul>
 *   <li>{@code .chatbot-openai-key}</li>
 *   <li>{@code .chatbot-hf-key}</li>
 * </ul>
 */
public class ChatbotApiKeyEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String PROP_OPENAI = "chatbot.openai.api-key";
    private static final String PROP_HF = "chatbot.huggingface.api-key";
    private static final String[] ENV_OPENAI = { "CHATBOT_OPENAI_API_KEY", "OPENAI_API_KEY" };
    private static final String[] ENV_HF = { "CHATBOT_HUGGINGFACE_API_KEY", "HUGGINGFACE_API_KEY", "HF_TOKEN" };
    private static final String FILE_OPENAI = ".chatbot-openai-key";
    private static final String FILE_HF = ".chatbot-hf-key";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Map<String, Object> map = new HashMap<>();
        loadKey(environment, PROP_OPENAI, ENV_OPENAI, FILE_OPENAI, map);
        loadKey(environment, PROP_HF, ENV_HF, FILE_HF, map);
        if (!map.isEmpty()) {
            environment.getPropertySources().addFirst(new MapPropertySource("chatbotApiKeyBootstrap", map));
        }
    }

    private static void loadKey(ConfigurableEnvironment env, String prop, String[] envVars, String fileName, Map<String, Object> map) {
        if (env.getProperty(prop) != null && !env.getProperty(prop).isBlank()) {
            return;
        }
        for (String ev : envVars) {
            String v = System.getenv(ev);
            if (v != null && !v.isBlank()) {
                map.put(prop, v.trim());
                return;
            }
        }
        Path userDir = Paths.get(System.getProperty("user.dir", ".")).toAbsolutePath().normalize();
        for (Path base : new Path[] { userDir, userDir.resolve("quiz-badge-service") }) {
            Path file = base.resolve(fileName);
            if (Files.isRegularFile(file)) {
                try {
                    String content = Files.readString(file).trim().replaceAll("\\s+", "");
                    if (!content.isEmpty()) {
                        map.put(prop, content);
                        return;
                    }
                } catch (IOException ignored) {
                    // ignore
                }
            }
        }
    }
}
