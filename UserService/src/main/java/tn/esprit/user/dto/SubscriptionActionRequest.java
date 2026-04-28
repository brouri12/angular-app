package tn.esprit.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionActionRequest {
    private String reason;
    private Boolean autoRenew;
    private Long newAbonnementId;
}
