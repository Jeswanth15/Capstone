package edu.example.edu.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.example.edu.Entity.AvatarStyle;

@Repository
public interface AvatarStyleRepository extends JpaRepository<AvatarStyle, Long> {

    Optional<AvatarStyle> findByStyleName(String styleName);

    List<AvatarStyle> findByIsActiveTrue();

    boolean existsByStyleName(String styleName);
}
