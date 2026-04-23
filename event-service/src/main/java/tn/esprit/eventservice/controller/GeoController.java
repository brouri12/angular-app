package tn.esprit.eventservice.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/events/geo")
@CrossOrigin(origins = {
        "http://localhost:4200",
        "http://localhost:4201"
})
public class GeoController {

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/geocode")
    public ResponseEntity<?> geocode(@RequestParam String address) {

        String q = URLEncoder.encode(address, StandardCharsets.UTF_8);

        String url =
                "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + q;

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "event-service");

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<Object[]> resp =
                restTemplate.exchange(url, HttpMethod.GET, entity, Object[].class);

        Object[] response = resp.getBody();

        if (response == null || response.length == 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Location not found"));
        }

        Map<String, Object> first = (Map<String, Object>) response[0];

        String displayName = first.get("display_name").toString();
        double lat = Double.parseDouble(first.get("lat").toString());
        double lon = Double.parseDouble(first.get("lon").toString());

        return ResponseEntity.ok(
                Map.of(
                        "address", displayName,
                        "lat", lat,
                        "lon", lon
                )
        );
    }
}