package edu.example.edu.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModuleTerritoryDTO {
    private String moduleName;
    private Long subjectId;
    private String subjectName;
    
    private String controllingTeamName;
    private Long controllingTeamId;
    private Integer controllingTeamPoints;
    
    private Integer totalChallengesPlayed;
    private List<CompetingTeamScoreDTO> competingTeams;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompetingTeamScoreDTO {
        private Long teamId;
        private String teamName;
        private Integer accumulatedPoints;
        private Integer challengesPlayed;
        private Integer rank;
        private Boolean isLeader;
    }
}
