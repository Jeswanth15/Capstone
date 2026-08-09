package edu.example.edu.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_unlocked_avatar", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"userId", "styleName"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUnlockedAvatar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String styleName;

    @Column(name = "unlocked_at", nullable = false)
    private LocalDateTime unlockedAt = LocalDateTime.now();
}
