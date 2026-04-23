package com.elearning.quizbadge.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Événement de proctoring envoyé par le client (détection caméra côté navigateur).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProctoringEventRequest {

    public static final String PHONE_DETECTED = "PHONE_DETECTED";
    public static final String MULTIPLE_PERSON_DETECTED = "MULTIPLE_PERSON_DETECTED";
    public static final String CAMERA_INTERRUPTED = "CAMERA_INTERRUPTED";

    @NotNull
    private Long studentId;

    @NotNull
    private Long quizId;

    /**
     * Une des constantes {@link #PHONE_DETECTED}, {@link #MULTIPLE_PERSON_DETECTED}, {@link #CAMERA_INTERRUPTED}.
     */
    @NotNull
    @Size(max = 64)
    private String eventType;

    @Size(max = 500)
    private String detail;
}
