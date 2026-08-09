package edu.example.edu.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "avatar_style")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvatarStyle {

    public enum UnlockType {
        FREE, LEVEL, COINS
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String styleName;

    @Column(nullable = false)
    private String displayName;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UnlockType unlockType = UnlockType.FREE;

    @Column(nullable = false)
    private Integer requiredLevel = 0;

    @Column(nullable = false)
    private Integer coinCost = 0;

    @Column(nullable = false)
    private Boolean isFree = true;

    @Column(nullable = false)
    private Boolean isActive = true;
}
