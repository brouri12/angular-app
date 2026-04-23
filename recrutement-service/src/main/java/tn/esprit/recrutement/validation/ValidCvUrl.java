package tn.esprit.recrutement.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = CvUrlValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidCvUrl {
    String message() default "URL du CV invalide";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
