package edu.example.edu.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MissionDTO {
    private String id;
    private String title;
    private String description;
    private String icon;
    private int progress;
    private int target;
    private boolean completed;
    private int rewardXP;
    private int rewardCoins;
    private String type; // "DAILY" or "WEEKLY"

    // Attendance breakdown details
    private Integer totalPeriods;
    private Integer attendedPeriods;
    private Integer absentPeriods;
    private Integer remainingPeriods;

    public MissionDTO(String id, String title, String description, String icon, int progress, int target, boolean completed, int rewardXP, int rewardCoins, String type) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.icon = icon;
        this.progress = progress;
        this.target = target;
        this.completed = completed;
        this.rewardXP = rewardXP;
        this.rewardCoins = rewardCoins;
        this.type = type;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }

    public int getTarget() { return target; }
    public void setTarget(int target) { this.target = target; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public int getRewardXP() { return rewardXP; }
    public void setRewardXP(int rewardXP) { this.rewardXP = rewardXP; }

    public int getRewardCoins() { return rewardCoins; }
    public void setRewardCoins(int rewardCoins) { this.rewardCoins = rewardCoins; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Integer getTotalPeriods() { return totalPeriods; }
    public void setTotalPeriods(Integer totalPeriods) { this.totalPeriods = totalPeriods; }

    public Integer getAttendedPeriods() { return attendedPeriods; }
    public void setAttendedPeriods(Integer attendedPeriods) { this.attendedPeriods = attendedPeriods; }

    public Integer getAbsentPeriods() { return absentPeriods; }
    public void setAbsentPeriods(Integer absentPeriods) { this.absentPeriods = absentPeriods; }

    public Integer getRemainingPeriods() { return remainingPeriods; }
    public void setRemainingPeriods(Integer remainingPeriods) { this.remainingPeriods = remainingPeriods; }
}
