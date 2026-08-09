package edu.example.edu.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.example.edu.Entity.UserNickname;

@Repository
public interface UserNicknameRepository extends JpaRepository<UserNickname, Long> {
    List<UserNickname> findByUserId(Long userId);
    Optional<UserNickname> findByUserIdAndNickname_Id(Long userId, Long nicknameId);
    Optional<UserNickname> findByUserIdAndIsEquippedTrue(Long userId);
    boolean existsByUserIdAndNickname_Id(Long userId, Long nicknameId);
}
