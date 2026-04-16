package tn.esprit.clubservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.clubservice.entity.Club;
import tn.esprit.clubservice.entity.ClubType;

import java.util.List;
import java.util.Optional;

public interface ClubRepository extends JpaRepository<Club, Long> {
    List<Club> findByType(ClubType type);
    List<Club> findByVille(String ville);
    boolean existsByNomClub(String nomClub);

    Optional<Club> findByNomClub(String nomClub);
    void deleteByNomClub(String nomClub);
}
