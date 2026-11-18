package edu.example.edu.Repository;

import edu.example.edu.Entity.TeamSessionAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeamSessionAnswerRepository extends JpaRepository<TeamSessionAnswer, Long> {

    List<TeamSessionAnswer> findBySession_Id(Long sessionId);

    Optional<TeamSessionAnswer> findBySession_IdAndQuestionNumber(Long sessionId, Integer questionNumber);
}
