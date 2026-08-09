package edu.example.edu.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "substitutions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Substitution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long substitutionId;

    @ManyToOne
    @JoinColumn(name = "timetable_id", nullable = false)
    private Timetable timetable;

    private LocalDate date;

    @ManyToOne
    @JoinColumn(name = "original_teacher_id", nullable = false)
    private User originalTeacher;

    @ManyToOne
    @JoinColumn(name = "substitute_teacher_id", nullable = false)
    private User substituteTeacher;

    private String reason;
}
