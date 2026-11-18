package edu.example.edu.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamSessionAnswerDTO {

    private Long sessionId;
    private Integer questionNumber;
    private String selectedOption;
    private Long studentId;
    private String studentName;
    private String updatedAt;
}
