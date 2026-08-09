package edu.example.edu.DTO;

import lombok.Data;
import java.util.List;

@Data
public class SubmissionComplianceDTO {
    private Long assignmentId;
    private String assignmentTitle;
    private int totalStudents;
    private List<StudentSubmissionStatusDTO> statuses;
}
