package edu.example.edu.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamLobbyStatusDTO {

    private Long challengeId;
    private String challengeTitle;
    private String subjectName;
    private String moduleName;
    private String difficulty;
    private String challengeDate;
    private String startTime;
    private String endTime;
    private Integer durationMinutes;
    private Integer questionCount;
    
    private Long teamId;
    private String teamName;
    private Integer totalTeamMembers;
    private Integer readyMembersCount;
    private Integer majorityThreshold;
    private Boolean majorityReached;

    private Long sessionId;
    private String sessionStatus; // WAITING, ACTIVE, COMPLETED
    private String generationStatus; // NOT_STARTED, GENERATING, GENERATED, FAILED

    private Boolean isCurrentUserReady;
    private String currentUserStatus;

    private List<MemberLobbyStatus> members;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberLobbyStatus {
        private Long userId;
        private String name;
        private String email;
        private Boolean isReady;
        private String status; // READY, ABSENT, WAITING
    }
}
