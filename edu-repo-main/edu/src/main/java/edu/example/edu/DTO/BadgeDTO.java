package edu.example.edu.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BadgeDTO {
    private String badgeCode;
    private String badgeName;
    private String description;
    private String icon;
    private String criteria;
    private LocalDateTime earnedAt;
}
