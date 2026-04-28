package com.gestions.ramzi.servicepronunciation.repositories;

import com.gestions.ramzi.servicepronunciation.entities.RecordingCollection;
import com.gestions.ramzi.servicepronunciation.enums.CollectionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RecordingCollectionRepository extends JpaRepository<RecordingCollection, Long> {
    RecordingCollection findByUserIdAndType(Long userId, CollectionType type);
    
    @Query("SELECT COUNT(r) FROM RecordingCollection r WHERE r.userId = :userId")
    long countByUserId(@Param("userId") Long userId);
}

