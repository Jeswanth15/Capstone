package edu.example.edu.DTO;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class SyllabusDTO {
    private Long syllabusId;
    private Long classSubjectId;
    private String title;
    private String description;
    private String moduleName;
    private String fileLink;
    private Long uploadedById;
    private LocalDateTime uploadedAt;
}
