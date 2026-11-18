package edu.example.edu.Repository;

import edu.example.edu.Entity.TeamChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TeamChallengeRepository extends JpaRepository<TeamChallenge, Long> {
    
    List<TeamChallenge> findByCreatedBy_UserIdOrderByIdDesc(Long userId);

    List<TeamChallenge> findByClassroom_ClassIdOrderByIdDesc(Long classId);

    @Query("SELECT DISTINCT tc FROM TeamChallenge tc JOIN ChallengeTeam ct ON ct.challenge = tc JOIN ChallengeTeamMember ctm ON ctm.team = ct WHERE ctm.student.userId = :studentId ORDER BY tc.id DESC")
    List<TeamChallenge> findChallengesByStudentId(@Param("studentId") Long studentId);
}
