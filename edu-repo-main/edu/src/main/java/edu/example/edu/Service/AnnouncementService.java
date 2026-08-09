package edu.example.edu.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.example.edu.DTO.AnnouncementDTO;
import edu.example.edu.Entity.Announcement;
import edu.example.edu.Entity.Classroom;
import edu.example.edu.Entity.User;
import edu.example.edu.Repository.AnnouncementRepository;
import edu.example.edu.Repository.ClassroomRepository;
import edu.example.edu.Repository.UserRepository;

@Service
public class AnnouncementService {

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private ClassroomRepository classroomRepository;

    @Autowired
    private UserRepository userRepository;

    // Convert Entity to DTO
    private AnnouncementDTO toDTO(Announcement announcement) {
        AnnouncementDTO dto = new AnnouncementDTO();

        dto.setAnnouncementId(announcement.getAnnouncementId());
        dto.setClassroomId(
            announcement.getClassroom() != null ? announcement.getClassroom().getClassId() : null
        );
        dto.setUserId(announcement.getPostedBy().getUserId());
        dto.setTitle(announcement.getTitle());
        dto.setMessage(announcement.getMessage());
        dto.setPostedAt(announcement.getPostedAt());
        dto.setSchoolId(announcement.getSchoolId());

        return dto;
    }

    // Convert DTO to Entity
    private Announcement toEntity(AnnouncementDTO dto) {
        Announcement announcement = new Announcement();

        announcement.setAnnouncementId(dto.getAnnouncementId());

        // classroom optional
        Classroom classroom = null;
        if (dto.getClassroomId() != null) {
            classroom = classroomRepository.findById(dto.getClassroomId())
                .orElseThrow(() -> new RuntimeException("Classroom not found"));
        }

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        announcement.setClassroom(classroom);
        announcement.setPostedBy(user);
        announcement.setTitle(dto.getTitle());
        announcement.setMessage(dto.getMessage());
        announcement.setSchoolId(dto.getSchoolId());

        announcement.setPostedAt(
            dto.getPostedAt() != null ? dto.getPostedAt() : LocalDateTime.now()
        );

        return announcement;
    }

    // CREATE or UPDATE
    public AnnouncementDTO saveAnnouncement(AnnouncementDTO dto) {
        Announcement saved = announcementRepository.save(toEntity(dto));
        return toDTO(saved);
    }

    // GET ALL
    public List<AnnouncementDTO> getAllAnnouncements() {
        return announcementRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // GET BY CLASSROOM
    public List<AnnouncementDTO> getAnnouncementsByClassroom(Long classroomId) {
        return announcementRepository.findByClassroom_ClassId(classroomId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // GET BY USER
    public List<AnnouncementDTO> getAnnouncementsByUser(Long userId) {
        return announcementRepository.findByPostedBy_UserId(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ✅ GET BY SCHOOL (new)
    public List<AnnouncementDTO> getAnnouncementsBySchool(Long schoolId) {
        return announcementRepository.findBySchoolIdOrderByAnnouncementIdDesc(schoolId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // DELETE
    public void deleteAnnouncement(Long announcementId) {
        announcementRepository.deleteById(announcementId);
    }
}
