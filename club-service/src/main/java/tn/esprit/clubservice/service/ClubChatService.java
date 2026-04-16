package tn.esprit.clubservice.service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tn.esprit.clubservice.dto.MemberLookupDto;
import tn.esprit.clubservice.dto.PostClubChatMessageRequest;
import tn.esprit.clubservice.entity.ClubChatMessage;
import tn.esprit.clubservice.repository.ClubChatMessageRepository;
import tn.esprit.clubservice.repository.ClubRepository;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Service
public class ClubChatService {

    private static final int MAX_MESSAGES = 100;

    private final ClubRepository clubRepository;
    private final ClubChatMessageRepository messageRepository;
    private final MemberLookupClient memberLookupClient;
    private final MemberFeignClient memberFeignClient;
    private final ProfanityApiClient profanityApiClient;

    public ClubChatService(
            ClubRepository clubRepository,
            ClubChatMessageRepository messageRepository,
            MemberLookupClient memberLookupClient,
            MemberFeignClient memberFeignClient,
            ProfanityApiClient profanityApiClient) {
        this.clubRepository = clubRepository;
        this.messageRepository = messageRepository;
        this.memberLookupClient = memberLookupClient;
        this.memberFeignClient = memberFeignClient;
        this.profanityApiClient = profanityApiClient;
    }

    @Transactional(readOnly = true)
    public List<ClubChatMessage> listMessages(Long clubId, Long idUser) {
        ensureClubExists(clubId);
        try {
            if (requireAcceptedMember(clubId, idUser) == null) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You must be an accepted member of this club to view the chat.");
            }
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            // Member service unavailable — allow read-only access gracefully
            System.out.println("⚠️ Member check skipped (service unavailable): " + e.getMessage());
        }
        var page = PageRequest.of(0, MAX_MESSAGES, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<ClubChatMessage> list = messageRepository.findByIdClubOrderByCreatedAtDesc(clubId, page);
        Collections.reverse(list);
        return list;
    }

    @Transactional
    public ClubChatMessage postMessage(Long clubId, PostClubChatMessageRequest body) {
        ensureClubExists(clubId);
        MemberLookupDto member = requireAcceptedMember(clubId, body.getIdUser());
        if (member == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only accepted members can write in the club chat.");
        }

        String trimmed = body.getContent().trim();
        if (trimmed.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message is empty.");
        }

        boolean bad;
        try {
            bad = profanityApiClient.containsProfanity(trimmed);
            System.out.println("🔍 Profanity check [" + trimmed + "] → " + bad);
        } catch (Exception e) {
            System.out.println("⚠️ Profanity API error: " + e.getMessage());
            bad = false;
        }
        if (bad) {
            notifyScore(body.getIdUser(), clubId, -10);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message contains inappropriate language.");
        }

        boolean isSpam = isSpam(clubId, body.getIdUser(), trimmed);
        if (isSpam) {
            notifyScore(body.getIdUser(), clubId, -10);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Spam detected: same message sent 3 times.");
        }

        String sender = buildSenderName(member);
        ClubChatMessage m = new ClubChatMessage();
        m.setIdClub(clubId);
        m.setIdUser(body.getIdUser());
        m.setSenderName(sender);
        m.setContent(trimmed);
        ClubChatMessage saved = messageRepository.save(m);

        notifyScore(body.getIdUser(), clubId, 5);

        return saved;
    }

    private boolean isSpam(Long clubId, Long idUser, String content) {
        var recent = messageRepository.findTop3ByIdClubAndIdUserOrderByCreatedAtDesc(clubId, idUser);
        if (recent.size() < 3) return false;
        return recent.stream().allMatch(m -> m.getContent().equalsIgnoreCase(content));
    }

    @Async
    void notifyScore(Long idUser, Long clubId, int points) {
        try {
            memberFeignClient.addScore(idUser, clubId, points);
        } catch (Exception e) {
            System.out.println("⚠️ Score update failed: " + e.getMessage());
        }
    }

    private void ensureClubExists(Long clubId) {
        clubRepository.findById(clubId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Club not found."));
    }

    private MemberLookupDto requireAcceptedMember(Long clubId, Long idUser) {
        List<MemberLookupDto> memberships;
        try {
            memberships = memberLookupClient.findMembershipsByUser(idUser);
        } catch (Exception e) {
            System.out.println("⚠️ Member service unreachable: " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Member service unavailable.");
        }
        if (memberships == null) return null;
        return memberships.stream()
                .filter(m -> Objects.equals(m.getIdClub(), clubId))
                .filter(m -> "ACCEPTED".equalsIgnoreCase(m.getStatus()))
                .findFirst()
                .orElse(null);
    }

    private static String buildSenderName(MemberLookupDto m) {
        String p = m.getPrenom() != null ? m.getPrenom().trim() : "";
        String n = m.getNom() != null ? m.getNom().trim() : "";
        String combined = (p + " " + n).trim();
        return combined.isEmpty() ? "Member" : combined;
    }
}
