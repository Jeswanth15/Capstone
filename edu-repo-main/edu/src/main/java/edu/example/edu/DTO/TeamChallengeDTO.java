package edu.example.edu.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamChallengeDTO {

    private Long id;
    private String title;
    private Long classId;
    private String className;
    private String classSection;
    private Long subjectId;
    private String subjectName;
    private Long classSubjectId;
    private String moduleName;
    private String difficulty;
    private LocalDate challengeDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer durationMinutes;
    private Integer questionCount;
    private Integer maxChatMessagesPerStudent;
    private Long teacherId;
    private String teacherName;
    private LocalDateTime createdAt;
    private String sessionStatus;
    private List<TeamDTO> teams;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamDTO {
        private Long id;
        private String name;
        private List<StudentDTO> members;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentDTO {
        private Long userId;
        private String name;
        private String email;
    }
}
