package edu.example.edu.DTO;

import lombok.Data;

@Data
public class ClassroomDTO {
    private Long classId;
    private String name;
    private String section;
    private Long schoolId;
    private Long classTeacherId;
    private String classTeacherName; // new
}
