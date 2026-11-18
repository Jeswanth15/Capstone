package edu.example.edu.Repository;

import edu.example.edu.Entity.ChallengeTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChallengeTeamRepository extends JpaRepository<ChallengeTeam, Long> {

    List<ChallengeTeam> findByChallenge_Id(Long challengeId);

    Optional<ChallengeTeam> findByChallenge_IdAndMembers_Student_UserId(Long challengeId, Long studentId);
}
