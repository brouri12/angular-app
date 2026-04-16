package tn.esprit.clubservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import tn.esprit.clubservice.dto.MemberLookupDto;

import java.util.List;

@Component
public class MemberLookupClient {

    private final RestTemplate restTemplate;
    private final String memberServiceBaseUrl;

    public MemberLookupClient(
            RestTemplate restTemplate,
            @Value("${club.chat.member-service-base-url:http://localhost:8888}") String memberServiceBaseUrl) {
        this.restTemplate = restTemplate;
        this.memberServiceBaseUrl = memberServiceBaseUrl.replaceAll("/$", "");
    }

    public List<MemberLookupDto> findMembershipsByUser(Long idUser) {
        String url = memberServiceBaseUrl + "/membres/by-user/" + idUser;
        return restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<MemberLookupDto>>() {}
        ).getBody();
    }
}
