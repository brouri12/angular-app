package tn.esprit.memberservice.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.esprit.memberservice.dto.UpdateMemberRoleRequest;
import tn.esprit.memberservice.dto.UpdateMemberStatusRequest;
import tn.esprit.memberservice.entity.Member;
import tn.esprit.memberservice.entity.MemberStatus;
import tn.esprit.memberservice.service.MemberService;

import java.util.List;

@RestController
@RequestMapping("/membres")
public class MemberController {

    private final MemberService service;

    public MemberController(MemberService service) {
        this.service = service;
    }

    // ==========================
    // CRUD
    // ==========================

    @PostMapping
    public Member create(@Valid @RequestBody Member m) {
        return service.create(m);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public List<Member> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Member getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/by-user/{idUser}")
    public List<Member> getByUser(@PathVariable Long idUser) {
        return service.getByUser(idUser);
    }

    @GetMapping("/club/{idClub}")
    public List<Member> getByClub(@PathVariable Long idClub) {
        return service.getByClub(idClub);
    }

    @GetMapping("/exists/{idUser}/{idClub}")
    public boolean exists(@PathVariable Long idUser, @PathVariable Long idClub) {
        return service.isJoined(idUser, idClub);
    }

    // ==========================
    // STATUS — ADMIN uniquement
    // ==========================

    @GetMapping("/pending")
    public List<Member> getPending() {
        return service.getByStatus(MemberStatus.PENDING);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/accept")
    public Member accept(@PathVariable Long id) {
        return service.updateStatus(id, MemberStatus.ACCEPTED);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/deny")
    public Member deny(@PathVariable Long id) {
        return service.updateStatus(id, MemberStatus.DENIED);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/status")
    public Member setStatus(@PathVariable Long id, @Valid @RequestBody UpdateMemberStatusRequest body) {
        return service.updateStatus(id, body.getStatus());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/role")
    public Member updateRole(@PathVariable Long id, @Valid @RequestBody UpdateMemberRoleRequest body) {
        return service.updateRole(id, body.getRole());
    }

    // ==========================
    // SCORE (appel interne Feign)
    // ==========================

    @PostMapping("/score")
    public ResponseEntity<Member> addScore(
            @RequestParam Long idUser,
            @RequestParam Long idClub,
            @RequestParam int points) {
        return ResponseEntity.ok(service.addScore(idUser, idClub, points));
    }

    // ==========================
    // BADGE
    // ==========================

    @GetMapping("/verify/{badgeId}")
    public ResponseEntity<?> verifyBadge(@PathVariable String badgeId) {
        return service.verifyBadge(badgeId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/badge/{idUser}/{idClub}")
    public ResponseEntity<String> sendBadge(@PathVariable Long idUser, @PathVariable Long idClub) {
        service.sendBadgeEmail(idUser, idClub);
        return ResponseEntity.ok("QR badge envoyé par email.");
    }

    @GetMapping(value = "/badge/pdf/{idUser}/{idClub}", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getBadgePdf(@PathVariable Long idUser, @PathVariable Long idClub) {
        byte[] pdfBytes = service.generateBadgePdf(idUser, idClub);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=badge.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handle(RuntimeException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}
