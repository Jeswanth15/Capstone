package edu.example.edu.DTO;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDTO {

    private Long attendanceId;
    private Long studentId;
    private Long classroomId;
    private Long subjectId;
    private Long calendarId;
    private LocalDate date;
    private int periodNumber; // new
    private String status;
}
