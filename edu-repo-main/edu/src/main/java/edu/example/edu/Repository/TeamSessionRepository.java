package edu.example.edu.Repository;

import edu.example.edu.Entity.TeamSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface TeamSessionRepository extends JpaRepository<TeamSession, Long> {

    Optional<TeamSession> findByChallenge_IdAndTeam_Id(Long challengeId, Long teamId);

    List<TeamSession> findByChallenge_Id(Long challengeId);
}
