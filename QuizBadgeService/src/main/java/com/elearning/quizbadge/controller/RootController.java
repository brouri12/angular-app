package com.elearning.quizbadge.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Page d'accueil sur {@code /} (tous les clients, quel que soit {@code Accept}).
 */
@RestController
public class RootController {

    private static final String HOME_HTML = """
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                  <meta charset="utf-8"/>
                  <title>quiz-badge-service</title>
                  <style>
                    body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem; }
                    code { background: #f4f4f4; padding: 0.15rem 0.35rem; border-radius: 4px; }
                    a { color: #0b57d0; }
                  </style>
                </head>
                <body>
                  <h1>quiz-badge-service</h1>
                  <p>Le service tourne sur le port <strong>8082</strong>. Utilisez des liens ci-dessous ou les API REST.</p>
                  <ul>
                    <li><a href="/api/questions/test">Test API JSON</a> (<code>GET /api/questions/test</code>)</li>
                    <li><a href="/actuator/health">Santé</a> (<code>GET /actuator/health</code>)</li>
                  </ul>
                  <p><strong>Important :</strong> ouvrez en <code>http://</code> (pas <code>https://</code>) sauf si vous avez configuré TLS.</p>
                </body>
                </html>
                """;

    @GetMapping("/")
    public ResponseEntity<String> home() {
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(HOME_HTML);
    }
}
