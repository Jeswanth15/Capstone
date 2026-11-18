package edu.example.edu.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "team_student_participations", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"session_id", "student_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamStudentParticipation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "session_id", nullable = false)
    private TeamSession session;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(nullable = false)
    private Boolean joined = true;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false)
    private Boolean participated = true;

    @Column(nullable = false)
    private Integer chatCount = 0;

    @Column(nullable = false)
    private String completionStatus = "COMPLETED"; // COMPLETED, ABSENT

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
