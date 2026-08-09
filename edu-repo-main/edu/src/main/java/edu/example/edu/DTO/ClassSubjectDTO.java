package edu.example.edu.DTO;

import lombok.Data;

@Data
public class ClassSubjectDTO {
    private Long id;

    private Long classroomId;
    private String classroomName;  // new
    private String classroomSection; // new

    private Long subjectId;
    private String subjectName;  // new

    private Long teacherId;
    private String teacherName; // new

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getClassroomId() { return classroomId; }
    public void setClassroomId(Long classroomId) { this.classroomId = classroomId; }

    public String getClassroomName() { return classroomName; }
    public void setClassroomName(String classroomName) { this.classroomName = classroomName; }

    public String getClassroomSection() { return classroomSection; }
    public void setClassroomSection(String classroomSection) { this.classroomSection = classroomSection; }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public Long getTeacherId() { return teacherId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }
}
