package edu.example.edu.DTO;

import lombok.Data;
import java.time.LocalDate;

@Data
public class SubstitutionDTO {
    private Long substitutionId;
    private Long timetableId;
    private LocalDate date;
    private Long originalTeacherId;
    private Long substituteTeacherId;
    private String reason;
}
