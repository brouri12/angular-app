package tn.esprit.clubservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class PostClubChatMessageRequest {

    @NotNull(message = "idUser est obligatoire")
    private Long idUser;

    @NotBlank(message = "Le message est obligatoire")
    @Size(max = 2000, message = "Message trop long (max 2000 caractères)")
    private String content;

    public Long getIdUser() { return idUser; }
    public void setIdUser(Long idUser) { this.idUser = idUser; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
