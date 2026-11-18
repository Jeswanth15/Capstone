package edu.example.edu.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "team_challenges")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TeamChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "classroom_id", nullable = false)
    private Classroom classroom;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "class_subject_id", nullable = false)
    private ClassSubject classSubject;

    @Column(nullable = false)
    private String moduleName;

    @Column(nullable = false)
    private String difficulty; // EASY, MEDIUM, HARD

    @Column(nullable = false)
    private LocalDate challengeDate;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    private Integer durationMinutes = 15;

    @Column(nullable = false)
    private Integer questionCount = 10;

    @Column(nullable = false)
    private Integer maxChatMessagesPerStudent = 5;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (questionCount == null) {
            questionCount = 10;
        }
        if (durationMinutes == null) {
            durationMinutes = 15;
        }
        if (maxChatMessagesPerStudent == null) {
            maxChatMessagesPerStudent = 5;
        }
    }
}
