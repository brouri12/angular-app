package tn.esprit.memberservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.memberservice.entity.Member;
import tn.esprit.memberservice.entity.MemberRole;
import tn.esprit.memberservice.entity.MemberStatus;

import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    boolean existsByIdUserAndIdClub(Long idUser, Long idClub);

    List<Member> findByIdUser(Long idUser);

    Optional<Member> findByIdUserAndIdClub(Long idUser, Long idClub);

    List<Member> findByStatus(MemberStatus status);

    List<Member> findByIdClub(Long idClub);

    java.util.Optional<Member> findByBadgeId(String badgeId);

    boolean existsByIdClubAndRole(Long idClub, MemberRole role);

    boolean existsByIdUserAndRole(Long idUser, MemberRole role);
}