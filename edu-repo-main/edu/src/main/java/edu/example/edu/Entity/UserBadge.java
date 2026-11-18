package edu.example.edu.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_badges", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "badge_code"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "badge_code", nullable = false)
    private String badgeCode; // e.g. FIRST_CHALLENGE, TEAM_PLAYER, TOP_SCORER, MODULE_MASTER, CHALLENGE_WINNER, CONSISTENT_PLAYER

    @Column(name = "badge_name", nullable = false)
    private String badgeName;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String icon; // Icon emoji or symbol e.g. 🏆, 🤝, 🎯, 👑, 🏰, 🔥

    private String criteria;

    @Column(name = "earned_at", nullable = false)
    private LocalDateTime earnedAt = LocalDateTime.now();

    @PrePersist
    public void onCreate() {
        if (earnedAt == null) {
            earnedAt = LocalDateTime.now();
        }
    }
}
