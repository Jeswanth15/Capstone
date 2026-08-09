package edu.example.edu.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.example.edu.Entity.CoinHistory;

@Repository
public interface CoinHistoryRepository extends JpaRepository<CoinHistory, Long> {
    List<CoinHistory> findByUser_UserIdOrderByCreatedAtDesc(Long userId);
    boolean existsByUser_UserIdAndActivity(Long userId, String activity);
}
