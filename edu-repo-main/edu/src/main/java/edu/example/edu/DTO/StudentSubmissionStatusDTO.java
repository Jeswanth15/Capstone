package edu.example.edu.DTO;

import lombok.Data;

@Data
public class StudentSubmissionStatusDTO {
    private Long studentId;
    private String studentName;
    private boolean submitted;
    private SubmissionDTO submission;
}
