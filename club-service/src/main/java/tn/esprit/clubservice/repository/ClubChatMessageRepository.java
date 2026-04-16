package tn.esprit.clubservice.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.clubservice.entity.ClubChatMessage;

import java.util.List;

public interface ClubChatMessageRepository extends JpaRepository<ClubChatMessage, Long> {

    List<ClubChatMessage> findByIdClubOrderByCreatedAtDesc(Long idClub, Pageable pageable);

    List<ClubChatMessage> findTop3ByIdClubAndIdUserOrderByCreatedAtDesc(Long idClub, Long idUser);
}
