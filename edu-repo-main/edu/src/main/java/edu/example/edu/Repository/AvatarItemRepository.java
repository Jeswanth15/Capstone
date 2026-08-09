package edu.example.edu.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.example.edu.Entity.AvatarItem;
import edu.example.edu.Entity.AvatarItem.Category;

@Repository
public interface AvatarItemRepository extends JpaRepository<AvatarItem, Long> {

    List<AvatarItem> findByIsActiveTrue();

    List<AvatarItem> findByCategoryAndIsActiveTrue(Category category);

    Optional<AvatarItem> findByCategoryAndItemKey(Category category, String itemKey);
}
