package edu.example.edu.DTO;

import lombok.Data;

@Data
public class AvatarStyleDTO {
    private String styleName;
    private String displayName;
    private String description;
    private String unlockType;
    private Integer requiredLevel;
    private Integer coinCost;
    private Boolean unlocked;
    private String lockedReason;
    private Boolean isFree;
}
