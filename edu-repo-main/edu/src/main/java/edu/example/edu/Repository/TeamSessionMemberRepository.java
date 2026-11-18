package edu.example.edu.Repository;

import edu.example.edu.Entity.TeamSessionMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeamSessionMemberRepository extends JpaRepository<TeamSessionMember, Long> {

    List<TeamSessionMember> findBySession_Id(Long sessionId);

    Optional<TeamSessionMember> findBySession_IdAndStudent_UserId(Long sessionId, Long studentId);
}
