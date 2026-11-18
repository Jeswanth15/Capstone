package edu.example.edu.Repository;

import edu.example.edu.Entity.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    List<UserBadge> findByUser_UserId(Long userId);
    Optional<UserBadge> findByUser_UserIdAndBadgeCode(Long userId, String badgeCode);
    boolean existsByUser_UserIdAndBadgeCode(Long userId, String badgeCode);
}
