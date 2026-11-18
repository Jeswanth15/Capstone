package edu.example.edu.Repository;

import edu.example.edu.Entity.TeamChallengeResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamChallengeResultRepository extends JpaRepository<TeamChallengeResult, Long> {
    Optional<TeamChallengeResult> findBySession_Id(Long sessionId);
    List<TeamChallengeResult> findBySubject_SubjectId(Long subjectId);
    List<TeamChallengeResult> findBySubject_SubjectIdAndModuleName(Long subjectId, String moduleName);
    List<TeamChallengeResult> findByTeam_Id(Long teamId);
    List<TeamChallengeResult> findByChallenge_Id(Long challengeId);
}
