package edu.example.edu.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.example.edu.DTO.AnnouncementDTO;
import edu.example.edu.Service.AnnouncementService;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    @Autowired
    private AnnouncementService announcementService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public ResponseEntity<AnnouncementDTO> saveAnnouncement(@RequestBody AnnouncementDTO dto) {
        return ResponseEntity.ok(announcementService.saveAnnouncement(dto));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public ResponseEntity<List<AnnouncementDTO>> getAll() {
        return ResponseEntity.ok(announcementService.getAllAnnouncements());
    }

    @GetMapping("/classroom/{classroomId}")
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public ResponseEntity<List<AnnouncementDTO>> getByClassroom(@PathVariable Long classroomId) {
        return ResponseEntity.ok(announcementService.getAnnouncementsByClassroom(classroomId));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public ResponseEntity<List<AnnouncementDTO>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(announcementService.getAnnouncementsByUser(userId));
    }

    @GetMapping("/school/{schoolId}")
    @PreAuthorize("hasAnyAuthority('TEACHER','STUDENT','SCHOOLADMIN','PRINCIPAL')")
    public ResponseEntity<List<AnnouncementDTO>> getBySchool(@PathVariable Long schoolId) {
        return ResponseEntity.ok(announcementService.getAnnouncementsBySchool(schoolId));
    }

    @DeleteMapping("/{announcementId}")
    @PreAuthorize("hasAnyAuthority('SCHOOLADMIN','PRINCIPAL','ADMIN')")
    public ResponseEntity<String> delete(@PathVariable Long announcementId) {
        announcementService.deleteAnnouncement(announcementId);
        return ResponseEntity.ok("Announcement deleted successfully");
    }
}
