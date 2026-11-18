package edu.example.edu.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTeamChallengeRequest {

    private String title;
    private Long classId;
    private Long subjectId;
    private Long classSubjectId;
    private String moduleName;
    private String difficulty; // EASY, MEDIUM, HARD
    private LocalDate challengeDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer durationMinutes = 15;
    private Integer questionCount = 10;
    private Integer maxChatMessagesPerStudent = 5;
    private Long teacherId;
    private List<TeamConfig> teams;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamConfig {
        private String name;
        private List<Long> studentIds;
    }
}
