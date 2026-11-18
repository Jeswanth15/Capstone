package edu.example.edu.Repository;

import edu.example.edu.Entity.ChallengeTeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChallengeTeamMemberRepository extends JpaRepository<ChallengeTeamMember, Long> {

    List<ChallengeTeamMember> findByTeam_Id(Long teamId);

    Optional<ChallengeTeamMember> findByTeam_Challenge_IdAndStudent_UserId(Long challengeId, Long studentId);
}
