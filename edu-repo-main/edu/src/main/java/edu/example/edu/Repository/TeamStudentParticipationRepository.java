package edu.example.edu.Repository;

import edu.example.edu.Entity.TeamStudentParticipation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamStudentParticipationRepository extends JpaRepository<TeamStudentParticipation, Long> {
    List<TeamStudentParticipation> findBySession_Id(Long sessionId);
    Optional<TeamStudentParticipation> findBySession_IdAndStudent_UserId(Long sessionId, Long studentId);
    List<TeamStudentParticipation> findByStudent_UserId(Long studentId);
}
