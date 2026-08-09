package edu.example.edu.Entity;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    public enum Role {
        STUDENT, TEACHER, PRINCIPAL, SCHOOLADMIN, ADMIN, DRIVER
    }

    public enum ApprovalStatus {
        PENDING, APPROVED, REJECTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @ManyToOne
    @JoinColumn(name = "school_id", nullable = true)
    private School school;

    @JsonIgnore
    @OneToMany(mappedBy = "teacher")
    private List<ClassSubject> teachingSubjects;

    @JsonIgnore
    @OneToMany(mappedBy = "teacher")
    private List<Timetable> timetableEntries;

    @JsonIgnore
    @OneToMany(mappedBy = "originalTeacher")
    private List<Substitution> substitutionsAsOriginal;

    @JsonIgnore
    @OneToMany(mappedBy = "substituteTeacher")
    private List<Substitution> substitutionsAsSubstitute;

    @JsonIgnore
    @OneToMany(mappedBy = "student")
    private List<Enrollment> enrollments;

    @ManyToOne
    @JoinColumn(name = "classroom_id")
    private Classroom classroom;

    @Column(name = "student_type")
    private String studentType; // e.g., "DAY_SCHOLAR", "HOSTELLER"

    @Column(name = "assigned_stop_id")
    private Long assignedStopId; // only applicable for day scholars

    @Column(name = "total_xp")
    private Integer totalXp = 0;

    @Column(name = "current_level")
    private Integer currentLevel = 1;

    @Column(name = "coins")
    private Integer coins = 0;

    @Column(name = "current_streak")
    private Integer currentStreak = 1;

    @Column(name = "last_login_date")
    private java.time.LocalDate lastLoginDate;

    @Column(name = "equipped_nickname")
    private String equippedNickname;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

    public Integer getCurrentStreak() { return currentStreak != null ? currentStreak : 1; }
    public void setCurrentStreak(Integer currentStreak) { this.currentStreak = currentStreak; }

    public java.time.LocalDate getLastLoginDate() { return lastLoginDate; }
    public void setLastLoginDate(java.time.LocalDate lastLoginDate) { this.lastLoginDate = lastLoginDate; }

    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getEquippedNickname() { return equippedNickname; }
    public void setEquippedNickname(String equippedNickname) { this.equippedNickname = equippedNickname; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public ApprovalStatus getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(ApprovalStatus approvalStatus) { this.approvalStatus = approvalStatus; }

    public School getSchool() { return school; }
    public void setSchool(School school) { this.school = school; }

    public List<ClassSubject> getTeachingSubjects() { return teachingSubjects; }
    public void setTeachingSubjects(List<ClassSubject> teachingSubjects) { this.teachingSubjects = teachingSubjects; }

    public List<Timetable> getTimetableEntries() { return timetableEntries; }
    public void setTimetableEntries(List<Timetable> timetableEntries) { this.timetableEntries = timetableEntries; }

    public List<Substitution> getSubstitutionsAsOriginal() { return substitutionsAsOriginal; }
    public void setSubstitutionsAsOriginal(List<Substitution> substitutionsAsOriginal) { this.substitutionsAsOriginal = substitutionsAsOriginal; }

    public List<Substitution> getSubstitutionsAsSubstitute() { return substitutionsAsSubstitute; }
    public void setSubstitutionsAsSubstitute(List<Substitution> substitutionsAsSubstitute) { this.substitutionsAsSubstitute = substitutionsAsSubstitute; }

    public List<Enrollment> getEnrollments() { return enrollments; }
    public void setEnrollments(List<Enrollment> enrollments) { this.enrollments = enrollments; }

    public Classroom getClassroom() { return classroom; }
    public void setClassroom(Classroom classroom) { this.classroom = classroom; }

    public String getStudentType() { return studentType; }
    public void setStudentType(String studentType) { this.studentType = studentType; }

    public Long getAssignedStopId() { return assignedStopId; }
    public void setAssignedStopId(Long assignedStopId) { this.assignedStopId = assignedStopId; }

    public Integer getTotalXp() { return totalXp; }
    public void setTotalXp(Integer totalXp) { this.totalXp = totalXp; }

    public Integer getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(Integer currentLevel) { this.currentLevel = currentLevel; }

    public Integer getCoins() { return coins; }
    public void setCoins(Integer coins) { this.coins = coins; }
}
