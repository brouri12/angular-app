package com.gestions.ramzi.servicefeedback.dto;

import lombok.Data;

/** DTO for module/course (can be filled via another service). */
@Data
public class ModuleDTO {
    private Long id;
    private String name;
}
