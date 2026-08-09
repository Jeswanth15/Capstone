package edu.example.edu.DTO;

import lombok.Data;
import java.time.LocalDate;

@Data
public class SubmissionDTO {
    private Long submissionId;
    private Long assignmentId;
    private Long studentId;
    private LocalDate submissionDate;
    private String fileLink;
    private String grade;
    private String feedback;
    private String studentName;
}
