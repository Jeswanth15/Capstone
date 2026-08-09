package edu.example.edu.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "nicknames")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Nickname {

    public enum Category {
        LOGIN, MOCK_TEST, ATTENDANCE, ASSIGNMENT, XP, COIN, SPECIAL
    }

    public enum Rarity {
        COMMON, UNCOMMON, RARE, EPIC, LEGENDARY, MYTHIC
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String title;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @Column(nullable = false)
    private String unlockType; // e.g., "LOGIN_STREAK", "MOCK_TEST_COUNT", etc.

    @Column(nullable = false)
    private Integer requirementValue = 0;

    @Column(nullable = false)
    private String icon;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rarity rarity = Rarity.COMMON;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public String getUnlockType() { return unlockType; }
    public void setUnlockType(String unlockType) { this.unlockType = unlockType; }

    public Integer getRequirementValue() { return requirementValue; }
    public void setRequirementValue(Integer requirementValue) { this.requirementValue = requirementValue; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public Rarity getRarity() { return rarity; }
    public void setRarity(Rarity rarity) { this.rarity = rarity; }
}
