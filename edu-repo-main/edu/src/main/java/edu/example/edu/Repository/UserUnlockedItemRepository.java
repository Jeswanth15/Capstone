package edu.example.edu.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.example.edu.Entity.UserUnlockedItem;

@Repository
public interface UserUnlockedItemRepository extends JpaRepository<UserUnlockedItem, Long> {

    List<UserUnlockedItem> findByUserId(Long userId);

    boolean existsByUserIdAndAvatarItemId(Long userId, Long avatarItemId);
}
