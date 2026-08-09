package edu.example.edu.DTO;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeachingLogDTO {

    private Long id;
    private Long classSubjectId;
    private Long teacherId;
    private String topicTaught;
    private LocalDateTime taughtAt;
}
