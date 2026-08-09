package edu.example.edu.DTO;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardDTO {

    private int rank;
    private Long userId;
    private String name;
    private String nickname;
    private String className;
    private Integer level;
    private Integer xp;
    private Integer coins;
    private Long aiMockTestsCompleted;
    private LocalDateTime createdAt;
    private String currentBadge;
    private String avatarConfig; // JSON or avatar string if available
    private boolean isCurrentUser;
}
