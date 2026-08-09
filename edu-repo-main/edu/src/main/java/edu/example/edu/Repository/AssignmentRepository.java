package edu.example.edu.Repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.example.edu.Entity.Assignment;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByClassroom_ClassId(Long classId);  // use classId
    List<Assignment> findByTeacher_UserId(Long teacherId);   // already correct
    List<Assignment> findBySubject_SubjectId(Long subjectId); // already correct

    // Mission tracking — assignments due within a date range
    List<Assignment> findByClassroom_ClassIdAndDueDateBetween(Long classId, LocalDate startDate, LocalDate endDate);
}
