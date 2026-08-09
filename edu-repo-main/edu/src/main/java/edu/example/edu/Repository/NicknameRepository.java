package edu.example.edu.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.example.edu.Entity.Nickname;

@Repository
public interface NicknameRepository extends JpaRepository<Nickname, Long> {
    Optional<Nickname> findByTitle(String title);
    List<Nickname> findByCategory(Nickname.Category category);
}
