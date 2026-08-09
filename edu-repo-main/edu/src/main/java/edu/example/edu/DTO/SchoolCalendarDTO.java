package edu.example.edu.DTO;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SchoolCalendarDTO {

    private Long calendarId;
    private Long schoolId;
    private LocalDate date;
    private String status;
    private String description;
}
