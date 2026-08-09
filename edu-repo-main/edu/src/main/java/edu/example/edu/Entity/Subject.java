package edu.example.edu.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "subjects")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long subjectId;

    @Column(nullable = false)
    private String name;

    private String code;

    @OneToMany(mappedBy = "subject")
    private List<ClassSubject> classSubjects;

    @OneToMany(mappedBy = "subject")
    private List<Timetable> timetableEntries;
}
