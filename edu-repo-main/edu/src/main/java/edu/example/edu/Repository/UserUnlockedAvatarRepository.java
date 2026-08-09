package edu.example.edu.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.example.edu.Entity.UserUnlockedAvatar;

@Repository
public interface UserUnlockedAvatarRepository extends JpaRepository<UserUnlockedAvatar, Long> {

    List<UserUnlockedAvatar> findByUserId(Long userId);

    boolean existsByUserIdAndStyleName(Long userId, String styleName);
}
