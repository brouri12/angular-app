package tn.esprit.memberservice.dto;

import jakarta.validation.constraints.NotNull;
import tn.esprit.memberservice.entity.MemberStatus;

public class UpdateMemberStatusRequest {

    @NotNull(message = "status est obligatoire")
    private MemberStatus status;

    public MemberStatus getStatus() {
        return status;
    }

    public void setStatus(MemberStatus status) {
        this.status = status;
    }
}
