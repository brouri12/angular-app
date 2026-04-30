package tn.esprit.clubservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import tn.esprit.clubservice.dto.MemberLookupDto;
import tn.esprit.clubservice.dto.PostClubChatMessageRequest;
import tn.esprit.clubservice.entity.Club;
import tn.esprit.clubservice.entity.ClubChatMessage;
import tn.esprit.clubservice.repository.ClubChatMessageRepository;
import tn.esprit.clubservice.repository.ClubRepository;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClubChatServiceTest {

    @Mock ClubRepository clubRepository;
    @Mock ClubChatMessageRepository messageRepository;
    @Mock MemberLookupClient memberLookupClient;
    @Mock MemberFeignClient memberFeignClient;
    @Mock ProfanityApiClient profanityApiClient;

    @InjectMocks
    ClubChatService clubChatService;

    private Club club;
    private MemberLookupDto acceptedMember;
    private PostClubChatMessageRequest request;

    @BeforeEach
    void setUp() {
        club = new Club();
        club.setIdClub(1L);

        acceptedMember = new MemberLookupDto();
        acceptedMember.setIdClub(1L);
        acceptedMember.setIdUser(5L);
        acceptedMember.setStatus("ACCEPTED");
        acceptedMember.setNom("Bouazizi");
        acceptedMember.setPrenom("Mahdi");

        request = new PostClubChatMessageRequest();
        request.setIdUser(5L);
        request.setContent("Hello everyone!");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AA1 : Logique métier — Seul un membre ACCEPTED peut envoyer un message
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    void shouldThrowWhenUserIsNotAcceptedMember() {
        when(clubRepository.findById(1L)).thenReturn(Optional.of(club));
        when(memberLookupClient.findMembershipsByUser(5L)).thenReturn(List.of());

        assertThrows(ResponseStatusException.class,
            () -> clubChatService.postMessage(1L, request));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AA1 : Logique métier — Détection bad words
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    void shouldThrowWhenMessageContainsBadWords() {
        request.setContent("fuck this");
        when(clubRepository.findById(1L)).thenReturn(Optional.of(club));
        when(memberLookupClient.findMembershipsByUser(5L)).thenReturn(List.of(acceptedMember));
        when(profanityApiClient.containsProfanity("fuck this")).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> clubChatService.postMessage(1L, request));

        assertEquals(400, ex.getStatusCode().value());
        assertTrue(ex.getReason().contains("inappropriate"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AA1 : Logique métier — Détection spam (même message 3 fois)
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    void shouldThrowWhenSpamDetected() {
        String spamMsg = "hello";
        request.setContent(spamMsg);

        ClubChatMessage m1 = new ClubChatMessage(); m1.setContent(spamMsg);
        ClubChatMessage m2 = new ClubChatMessage(); m2.setContent(spamMsg);
        ClubChatMessage m3 = new ClubChatMessage(); m3.setContent(spamMsg);

        when(clubRepository.findById(1L)).thenReturn(Optional.of(club));
        when(memberLookupClient.findMembershipsByUser(5L)).thenReturn(List.of(acceptedMember));
        when(profanityApiClient.containsProfanity(spamMsg)).thenReturn(false);
        when(messageRepository.findTop3ByIdClubAndIdUserOrderByCreatedAtDesc(1L, 5L))
            .thenReturn(List.of(m1, m2, m3));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> clubChatService.postMessage(1L, request));

        assertEquals(400, ex.getStatusCode().value());
        assertTrue(ex.getReason().contains("Spam"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AA1 : Logique métier — Message valide sauvegardé correctement
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    void shouldSaveMessageWhenValid() {
        ClubChatMessage saved = new ClubChatMessage();
        saved.setContent("Hello everyone!");
        saved.setIdClub(1L);
        saved.setIdUser(5L);

        when(clubRepository.findById(1L)).thenReturn(Optional.of(club));
        when(memberLookupClient.findMembershipsByUser(5L)).thenReturn(List.of(acceptedMember));
        when(profanityApiClient.containsProfanity("Hello everyone!")).thenReturn(false);
        when(messageRepository.findTop3ByIdClubAndIdUserOrderByCreatedAtDesc(1L, 5L))
            .thenReturn(List.of());
        when(messageRepository.save(any())).thenReturn(saved);

        ClubChatMessage result = clubChatService.postMessage(1L, request);

        assertNotNull(result);
        assertEquals("Hello everyone!", result.getContent());
        verify(messageRepository, times(1)).save(any());
    }
}
