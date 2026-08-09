package edu.example.edu.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "announcements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long announcementId;

    @ManyToOne
    @JoinColumn(name = "classroom_id")
    private Classroom classroom; // null means school-wide

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User postedBy;

    @Column(nullable = false)
    private String title;

    @Lob
    private String message;

    private LocalDateTime postedAt;

    private Long schoolId; // ✅ added school-level announcements
}
