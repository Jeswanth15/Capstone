package edu.example.edu.DTO;

import lombok.Data;

@Data
public class AvatarItemDTO {
    private Long id;
    private String category;
    private String itemKey;
    private String displayName;
    private String unlockType;
    private Integer requiredLevel;
    private Integer coinCost;
    private Boolean isDefault;
    private Boolean unlocked;
    private Boolean equipped;
    private String lockedReason;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getItemKey() { return itemKey; }
    public void setItemKey(String itemKey) { this.itemKey = itemKey; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getUnlockType() { return unlockType; }
    public void setUnlockType(String unlockType) { this.unlockType = unlockType; }

    public Integer getRequiredLevel() { return requiredLevel; }
    public void setRequiredLevel(Integer requiredLevel) { this.requiredLevel = requiredLevel; }

    public Integer getCoinCost() { return coinCost; }
    public void setCoinCost(Integer coinCost) { this.coinCost = coinCost; }

    public Boolean getIsDefault() { return isDefault; }
    public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }

    public Boolean getUnlocked() { return unlocked; }
    public void setUnlocked(Boolean unlocked) { this.unlocked = unlocked; }

    public Boolean getEquipped() { return equipped; }
    public void setEquipped(Boolean equipped) { this.equipped = equipped; }

    public String getLockedReason() { return lockedReason; }
    public void setLockedReason(String lockedReason) { this.lockedReason = lockedReason; }
}
