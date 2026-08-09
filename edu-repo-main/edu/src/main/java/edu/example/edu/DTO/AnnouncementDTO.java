package edu.example.edu.DTO;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class AnnouncementDTO {
    private Long announcementId;
    private Long classroomId;   // null = school-wide
    private Long userId;
    private String title;
    private String message;
    private LocalDateTime postedAt;
    private Long schoolId;      // ✅ added
}
