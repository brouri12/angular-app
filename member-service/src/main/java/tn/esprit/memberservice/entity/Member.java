package tn.esprit.memberservice.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.util.Date;

@Entity
@Table(
        name = "members",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"id_user", "id_club"})
        }
)
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_member")
    private Long idMember;

    @NotNull(message = "idUser est obligatoire")
    @Column(name = "id_user", nullable = false)
    private Long idUser;

    @NotNull(message = "idClub est obligatoire")
    @Column(name = "id_club", nullable = false)
    private Long idClub;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "prenom", nullable = false)
    private String prenom;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "telephone", nullable = false)
    private String telephone;

    @NotNull(message = "niveauAnglais est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(name = "niveau_anglais", nullable = false)
    private NiveauAnglais niveauAnglais;

    @Temporal(TemporalType.DATE)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @Column(name = "date_join")
    private Date dateJoin;

    // ✅ Statut de la demande d'adhésion
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private MemberStatus status = MemberStatus.PENDING;

    /** Rôle dans le club (défaut : recrue) */
    @Enumerated(EnumType.STRING)
    @Column(name = "member_role")
    private MemberRole role = MemberRole.RECRUE;

    /** Identifiant unique du badge — généré à l'acceptation */
    @Column(name = "badge_id", unique = true)
    private String badgeId;

    /** Score de gamification */
    @Column(name = "score", nullable = false)
    private int score = 0;

    /** Niveau calculé depuis le score */
    @Enumerated(EnumType.STRING)
    @Column(name = "badge_level")
    private BadgeLevel badgeLevel = BadgeLevel.BRONZE;

    @PrePersist
    public void prePersist() {
        if (dateJoin == null) dateJoin = new Date();
        if (status == null) status = MemberStatus.PENDING;
        if (role == null) role = MemberRole.RECRUE;
        if (badgeId == null) badgeId = java.util.UUID.randomUUID().toString();
    }

    // Getters & Setters

    public Long getIdMember() { return idMember; }
    public void setIdMember(Long idMember) { this.idMember = idMember; }

    public Long getIdUser() { return idUser; }
    public void setIdUser(Long idUser) { this.idUser = idUser; }

    public Long getIdClub() { return idClub; }
    public void setIdClub(Long idClub) { this.idClub = idClub; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public NiveauAnglais getNiveauAnglais() { return niveauAnglais; }
    public void setNiveauAnglais(NiveauAnglais niveauAnglais) { this.niveauAnglais = niveauAnglais; }

    public Date getDateJoin() { return dateJoin; }
    public void setDateJoin(Date dateJoin) { this.dateJoin = dateJoin; }

    public MemberStatus getStatus() { return status; }
    public void setStatus(MemberStatus status) { this.status = status; }

    public MemberRole getRole() { return role != null ? role : MemberRole.RECRUE; }
    public void setRole(MemberRole role) { this.role = role; }

    public String getBadgeId() { return badgeId; }
    public void setBadgeId(String badgeId) { this.badgeId = badgeId; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public BadgeLevel getBadgeLevel() { return badgeLevel; }
    public void setBadgeLevel(BadgeLevel badgeLevel) { this.badgeLevel = badgeLevel; }
}