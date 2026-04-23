package tn.esprit.forum.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.forum.entity.NotificationForum;

import java.util.List;

@Repository
public interface NotificationForumRepository extends JpaRepository<NotificationForum, Long> {
    
    List<NotificationForum> findByDestinataireIdOrderByDateCreationDesc(Long destinataireId);
    
    List<NotificationForum> findByDestinataireIdAndLuOrderByDateCreationDesc(Long destinataireId, Boolean lu);
    
    Long countByDestinataireIdAndLu(Long destinataireId, Boolean lu);
    
    @Query("SELECT n FROM NotificationForum n WHERE n.destinataireId = :userId " +
           "AND n.lu = false ORDER BY n.dateCreation DESC")
    List<NotificationForum> findNotificationsNonLues(@Param("userId") Long userId);
}
