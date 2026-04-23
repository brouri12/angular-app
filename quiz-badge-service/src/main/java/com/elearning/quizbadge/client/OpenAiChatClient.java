package com.elearning.quizbadge.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

/**
 * Client OpenFeign vers OpenAI Chat Completions.
 *
 * Base URL configurable via {@code chatbot.openai.base-url}.
 */
@FeignClient(name = "openai-chat", url = "${chatbot.openai.base-url:https://api.openai.com}")
public interface OpenAiChatClient {

    @PostMapping(value = "/v1/chat/completions", consumes = MediaType.APPLICATION_JSON_VALUE)
    String chatCompletions(
            @RequestHeader("Authorization") String authorization,
            @RequestBody String jsonBody
    );
}

