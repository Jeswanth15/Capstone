package edu.example.edu.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserGamificationProfileDTO {
    private Long userId;
    private String name;
    private String email;
    private Integer totalXp;
    private Integer currentLevel;
    private Integer xpRequiredForNextLevel;
    private Double levelProgressPercentage;
    private Integer coins;
    private Integer currentStreak;
    private String equippedNickname;
    private List<BadgeDTO> badges;
    private Integer challengesCompleted;
}
