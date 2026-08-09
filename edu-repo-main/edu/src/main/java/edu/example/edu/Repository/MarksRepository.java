package edu.example.edu.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.example.edu.Entity.Marks;

@Repository
public interface MarksRepository extends JpaRepository<Marks, Long> {
    List<Marks> findByStudent_UserId(Long studentId);
    List<Marks> findBySubject_SubjectId(Long subjectId);
    Optional<Marks> findByStudent_UserIdAndExamSchedule_ExamScheduleId(Long studentId, Long examScheduleId);

    
}
