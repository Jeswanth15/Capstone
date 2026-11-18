package edu.example.edu.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardEntryDTO {
    private Integer rank;
    private Long id; // userId or teamId
    private String name; // student name or team name
    private Integer score;
    private Integer xp;
    private Integer level;
    private List<BadgeDTO> badges;
    private String secondaryInfo; // e.g. classroom name or member count
}
