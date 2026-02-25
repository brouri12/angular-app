package tn.esprit.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.user.entity.User;
import tn.esprit.user.entity.User.UserRole;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Recherche par username
    Optional<User> findByUsername(String username);
    
    // Recherche par email
    Optional<User> findByEmail(String email);
    
    // Vérifier si username existe
    boolean existsByUsername(String username);
    
    // Vérifier si email existe
    boolean existsByEmail(String email);
    
    // Recherche par rôle
    @Query("SELECT u FROM User u WHERE u.role = :role")
    List<User> findByRole(@Param("role") UserRole role);
    
    // Recherche par statut enabled
    @Query("SELECT u FROM User u WHERE u.enabled = :enabled")
    List<User> findByEnabled(@Param("enabled") Boolean enabled);
    
    // Recherche par rôle et statut
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.enabled = :enabled")
    List<User> findByRoleAndEnabled(@Param("role") UserRole role, @Param("enabled") Boolean enabled);
    
    // Recherche étudiants par statut
    @Query("SELECT u FROM User u WHERE u.role = 'STUDENT' AND u.statut_etudiant = :statut")
    List<User> findStudentsByStatut(@Param("statut") String statut);
    
    // Recherche enseignants par spécialité
    @Query("SELECT u FROM User u WHERE u.role = 'TEACHER' AND u.specialite LIKE %:specialite%")
    List<User> findTeachersBySpecialite(@Param("specialite") String specialite);
    
    // Recherche par nom ou prénom
    @Query("SELECT u FROM User u WHERE LOWER(u.nom) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.prenom) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<User> searchByNomOrPrenom(@Param("search") String search);
    
    // Compter par rôle
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    Long countByRole(@Param("role") UserRole role);
}
