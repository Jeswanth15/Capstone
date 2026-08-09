package edu.example.edu.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.example.edu.Entity.TeachingLog;

public interface TeachingLogRepository extends JpaRepository<TeachingLog, Long> {
    List<TeachingLog> findByClassSubject_Id(Long classSubjectId);
    List<TeachingLog> findByTeacher_UserId(Long teacherId);
}
