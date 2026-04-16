package tn.esprit.memberservice.entity;

/**
 * Rôle du membre au sein d'un club.
 */
public enum MemberRole {
    /** Nouveau membre, accès limité */
    RECRUE,
    /** Gère le club et peut valider les membres (côté métier / UI président) */
    PRESIDENT
}
