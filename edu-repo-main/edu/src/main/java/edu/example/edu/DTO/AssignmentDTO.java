package edu.example.edu.DTO;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AssignmentDTO {
    private Long assignmentId;
    private Long classroomId;
    private Long subjectId;
    private Long teacherId;
    private String title;
    private String description;
    private LocalDate dueDate;
    private String fileLink;
}
