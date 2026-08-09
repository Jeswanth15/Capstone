package edu.example.edu.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfilePreviewDTO {

    private Long userId;
    private String name;
    private String nickname;
    private String className;
    private Integer level;
    private Integer xp;
    private Integer coins;
    private Double attendancePercentage;
    private Integer achievementsCount;
    private String currentBadge;
    private Object avatarConfig;
}
