package edu.example.edu.Entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_avatar")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAvatar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    private String hair = "shortHair";
    private String eyes = "default";
    private String eyebrows = "default";
    private String mouth = "smile";
    private String glasses = "none";
    private String clothes = "collegeUniform";
    private String frame = "blue";
    private String background = "white";

    @Column(nullable = false)
    private String seed;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getHair() { return hair; }
    public void setHair(String hair) { this.hair = hair; }

    public String getEyes() { return eyes; }
    public void setEyes(String eyes) { this.eyes = eyes; }

    public String getEyebrows() { return eyebrows; }
    public void setEyebrows(String eyebrows) { this.eyebrows = eyebrows; }

    public String getMouth() { return mouth; }
    public void setMouth(String mouth) { this.mouth = mouth; }

    public String getGlasses() { return glasses; }
    public void setGlasses(String glasses) { this.glasses = glasses; }

    public String getClothes() { return clothes; }
    public void setClothes(String clothes) { this.clothes = clothes; }

    public String getFrame() { return frame; }
    public void setFrame(String frame) { this.frame = frame; }

    public String getBackground() { return background; }
    public void setBackground(String background) { this.background = background; }

    public String getSeed() { return seed; }
    public void setSeed(String seed) { this.seed = seed; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
