package edu.example.edu.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamChallengeResultDTO {
    private Long sessionId;
    private Long challengeId;
    private String challengeTitle;
    private Long teamId;
    private String teamName;
    private Long subjectId;
    private String subjectName;
    private String moduleName;

    private Integer totalQuestions;
    private Integer correctAnswers;
    private Integer incorrectAnswers;
    private Integer score;
    private Double percentage;

    private Integer xpEarned;
    private Integer currentUserTotalXp;
    private Integer currentUserLevel;
    private Integer xpRequiredForNextLevel;
    private Double levelProgressPercentage;

    private String currentModuleControllerTeam;
    private Long currentModuleControllerTeamId;
    private Integer modulePointsTotal;
    private Integer moduleRankPosition;

    private Boolean isModuleCapturedNow;
    private String previousModuleControllerTeam;

    private List<QuestionEvaluationDTO> questionEvaluations;
    private List<BadgeDTO> newBadgesEarned;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionEvaluationDTO {
        private Integer questionNumber;
        private String selectedOption;
        private String correctOption;
        private Boolean isCorrect;
        private Integer marksObtained;
        private String selectedByName;
    }
}
