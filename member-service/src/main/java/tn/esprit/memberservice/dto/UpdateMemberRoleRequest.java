package tn.esprit.memberservice.dto;

import jakarta.validation.constraints.NotNull;
import tn.esprit.memberservice.entity.MemberRole;

public class UpdateMemberRoleRequest {

    @NotNull(message = "role est obligatoire")
    private MemberRole role;

    public MemberRole getRole() {
        return role;
    }

    public void setRole(MemberRole role) {
        this.role = role;
    }
}
