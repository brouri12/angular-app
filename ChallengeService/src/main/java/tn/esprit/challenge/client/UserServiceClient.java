package tn.esprit.challenge.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * HTTP client for calling UserService endpoints.
 *
 * Routes through the API Gateway (port 8888) so Eureka load-balancing
 * and gateway filters are respected.
 *
 * Endpoints used:
 *   GET  /user-service/api/users/{id}/email      → single email lookup
 *   POST /user-service/api/users/emails-by-ids   → bulk email lookup
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class UserServiceClient {

    private final RestTemplate restTemplate;

    @Value("${app.gateway.url:http://localhost:8888}")
    private String gatewayUrl;

    private static final String BASE = "/user-service/api/users";

    // ── Single user email ──────────────────────────────────────────────────────

    /**
     * Fetch the email address of a single user by ID.
     *
     * @param userId the user's database ID
     * @return email string, or null if the user is not found / service unavailable
     */
    public String getUserEmail(Long userId) {
        String url = gatewayUrl + BASE + "/" + userId + "/email";
        try {
            ResponseEntity<Map<String, String>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<>() {}
            );
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody().get("email");
            }
        } catch (HttpClientErrorException.NotFound e) {
            log.warn("UserService: user {} not found", userId);
        } catch (Exception e) {
            log.error("UserService: failed to fetch email for user {}: {}", userId, e.getMessage());
        }
        return null;
    }

    // ── Bulk email lookup ──────────────────────────────────────────────────────

    /**
     * Fetch emails for a list of user IDs in a single HTTP call.
     *
     * @param userIds list of user IDs
     * @return map of userId → email (missing users are absent from the map)
     */
    public Map<Long, String> getEmailsByIds(List<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) return Collections.emptyMap();

        String url = gatewayUrl + BASE + "/emails-by-ids";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<List<Long>> request = new HttpEntity<>(userIds, headers);

            ResponseEntity<Map<Long, String>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    new ParameterizedTypeReference<>() {}
            );
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.error("UserService: failed to fetch bulk emails: {}", e.getMessage());
        }
        return Collections.emptyMap();
    }
}
