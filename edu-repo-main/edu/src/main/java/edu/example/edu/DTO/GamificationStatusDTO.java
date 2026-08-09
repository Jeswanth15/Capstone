package edu.example.edu.DTO;

import lombok.Data;

@Data
public class GamificationStatusDTO {
    private Integer totalXp;
    private Integer currentLevel;
    private String levelName;
    private Integer nextLevelXpThreshold;
    private Integer coins;
    private Integer currentStreak;
    private Boolean isFirstLoginToday;
    private Integer dailyXpEarned;
    private Integer dailyCoinsEarned;
}
