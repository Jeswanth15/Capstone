package edu.example.edu.Entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "team_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TeamSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "challenge_id", nullable = false)
    private TeamChallenge challenge;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "team_id", nullable = false)
    private ChallengeTeam team;

    @Column(nullable = false)
    private String status = "WAITING"; // WAITING, ACTIVE, COMPLETED

    @Column(nullable = false)
    private String generationStatus = "NOT_STARTED"; // NOT_STARTED, GENERATING, GENERATED, FAILED

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "submitted_by")
    private User submittedBy;

    private String submittedByName;

    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private LocalDateTime generatedAt;
}
