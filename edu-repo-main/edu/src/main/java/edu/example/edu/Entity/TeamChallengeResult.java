package edu.example.edu.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "team_challenge_results", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"session_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamChallengeResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "session_id", nullable = false)
    private TeamSession session;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "challenge_id", nullable = false)
    private TeamChallenge challenge;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "team_id", nullable = false)
    private ChallengeTeam team;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(nullable = false)
    private String moduleName;

    @Column(nullable = false)
    private Integer totalQuestions = 10;

    @Column(nullable = false)
    private Integer correctAnswers = 0;

    @Column(nullable = false)
    private Integer incorrectAnswers = 0;

    @Column(nullable = false)
    private Integer score = 0; // Base score out of 100

    @Column(nullable = false)
    private Double percentage = 0.0;

    @Column(nullable = false)
    private LocalDateTime submittedAt = LocalDateTime.now();

    @Column(name = "xp_awarded_per_member")
    private Integer xpAwardedPerMember = 0;

    @Column(name = "is_module_captured")
    private Boolean isModuleCaptured = false;

    @Column(name = "previous_module_leader")
    private String previousModuleLeader;

    @PrePersist
    public void onCreate() {
        if (submittedAt == null) {
            submittedAt = LocalDateTime.now();
        }
    }
}
