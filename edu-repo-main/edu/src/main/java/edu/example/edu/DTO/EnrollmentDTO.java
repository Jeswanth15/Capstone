package edu.example.edu.DTO;

import java.time.LocalDate;

import lombok.Data;

@Data
public class EnrollmentDTO {
    private Long enrollmentId;
    private Long classroomId;
    private Long studentId;
     private String studentName;  
    private LocalDate enrollmentDate;
}
