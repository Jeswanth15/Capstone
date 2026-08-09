package edu.example.edu.DTO;

import lombok.Data;

@Data
public class UserAvatarConfigDTO {
    private String hair;
    private String eyes;
    private String eyebrows;
    private String mouth;
    private String glasses;
    private String clothes;
    private String frame;
    private String background;
    private String seed;

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
}
