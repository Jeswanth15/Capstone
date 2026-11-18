package edu.example.edu.Repository;

import edu.example.edu.Entity.TeamSessionQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TeamSessionQuestionRepository extends JpaRepository<TeamSessionQuestion, Long> {

    List<TeamSessionQuestion> findBySession_IdOrderByQuestionNumberAsc(Long sessionId);
}
