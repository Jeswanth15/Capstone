package edu.example.edu.DTO;

import lombok.Data;

@Data
public class TimetableDTO {
    private Long timetableId;
    private Long classroomId;
    private Long subjectId;
    private Long teacherId;
    private String dayOfWeek;   
    private Integer periodNumber;
}