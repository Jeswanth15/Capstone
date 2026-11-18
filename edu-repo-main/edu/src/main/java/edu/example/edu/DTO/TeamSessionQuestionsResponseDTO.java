package edu.example.edu.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamSessionQuestionsResponseDTO {

    private Long sessionId;
    private Long challengeId;
    private Long teamId;
    private String teamName;
    private String status; // WAITING, ACTIVE, COMPLETED
    private String generationStatus; // NOT_STARTED, GENERATING, GENERATED, FAILED
    private String submittedByName;
    private Integer durationMinutes;
    private List<QuestionItemDTO> questions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionItemDTO {
        private Long id;
        private Integer questionNumber;
        private String questionText;
        private List<String> options;
        private String correctOption;
        private String explanation;
        private String difficulty;
        private String moduleName;
    }
}
