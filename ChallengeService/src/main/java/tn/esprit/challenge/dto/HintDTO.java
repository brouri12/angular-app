package tn.esprit.challenge.dto;

import lombok.Data;

@Data
public class HintDTO {
    private Long id;
    private Integer level;
    private String content;
    private Integer pointsCost;
}
