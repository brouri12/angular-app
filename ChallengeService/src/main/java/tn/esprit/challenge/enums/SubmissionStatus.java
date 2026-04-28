package tn.esprit.challenge.enums;

public enum SubmissionStatus {
    PENDING,          // Awaiting grading
    PASSED,           // Passed the challenge
    FAILED,           // Failed the challenge
    PARTIAL,          // Partially correct
    REQUIRES_GRADING  // Needs manual grading (writing/speaking)
}
