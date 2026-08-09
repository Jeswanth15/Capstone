
package edu.example.edu.DTO;

import java.time.LocalDate;

import lombok.Data;

@Data
public class MarksDTO {
    private Long marksId;
    private Long studentId;
    private String studentName;     // ✅ NEW
    private Long subjectId;
    private String subjectName;     // ✅ NEW
    private String examType;
    private Double marksObtained;
    private Double totalMarks;
    private LocalDate examDate;
    private Long examScheduleId;    // optional but helpful
}
