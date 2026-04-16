package tn.esprit.planification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.planification.entity.Group;
import tn.esprit.planification.enums.StudentLevel;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    
    List<Group> findByLevel(StudentLevel level);
    
    Optional<Group> findByLevelAndTeacherId(StudentLevel level, Long teacherId);
    
    List<Group> findByTeacherId(Long teacherId);
    
    @Modifying
    @Query("UPDATE Group g SET g.teacherId = :teacherId WHERE g.id = :groupId")
    void updateTeacherId(@Param("groupId") Long groupId, @Param("teacherId") Long teacherId);
}
