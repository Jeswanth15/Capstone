package edu.example.edu.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.example.edu.Entity.Announcement;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByClassroom_ClassId(Long classroomId);
    List<Announcement> findByPostedBy_UserId(Long userId);
    List<Announcement> findBySchoolIdOrderByAnnouncementIdDesc(Long schoolId);
}
