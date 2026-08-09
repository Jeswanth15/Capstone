package edu.example.edu.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.example.edu.Entity.XPHistory;

@Repository
public interface XPHistoryRepository extends JpaRepository<XPHistory, Long> {
    List<XPHistory> findByUser_UserIdOrderByCreatedAtDesc(Long userId);
    boolean existsByUser_UserIdAndActivity(Long userId, String activity);
}
