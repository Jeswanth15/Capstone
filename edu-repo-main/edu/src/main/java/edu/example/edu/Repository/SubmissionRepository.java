package edu.example.edu.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.example.edu.Entity.Submission;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByAssignment_AssignmentId(Long assignmentId);
    List<Submission> findByStudent_UserId(Long studentId);
    List<Submission> findByAssignment_AssignmentIdAndStudent_UserId(Long assignmentId, Long studentId);

}
