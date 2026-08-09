package edu.example.edu.Entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
@Table(name = "classrooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Classroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long classId;

    @Column(nullable = false)
    private String name;

    private String section;

    @ManyToOne
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "class_teacher_id")
    private User classTeacher;

    @JsonIgnore
    @OneToMany(mappedBy = "classroom")
    private List<ClassSubject> classSubjects;

    @JsonIgnore
    @OneToMany(mappedBy = "classroom")
    private List<Timetable> timetableEntries;

    @JsonIgnore
    @OneToMany(mappedBy = "classroom")
    private List<Enrollment> enrollments;

    public Long getClassId() { return classId; }
    public void setClassId(Long classId) { this.classId = classId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public School getSchool() { return school; }
    public void setSchool(School school) { this.school = school; }

    public User getClassTeacher() { return classTeacher; }
    public void setClassTeacher(User classTeacher) { this.classTeacher = classTeacher; }

    public List<ClassSubject> getClassSubjects() { return classSubjects; }
    public void setClassSubjects(List<ClassSubject> classSubjects) { this.classSubjects = classSubjects; }

    public List<Timetable> getTimetableEntries() { return timetableEntries; }
    public void setTimetableEntries(List<Timetable> timetableEntries) { this.timetableEntries = timetableEntries; }

    public List<Enrollment> getEnrollments() { return enrollments; }
    public void setEnrollments(List<Enrollment> enrollments) { this.enrollments = enrollments; }
}
