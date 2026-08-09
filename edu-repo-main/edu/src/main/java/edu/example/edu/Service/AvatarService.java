package edu.example.edu.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.example.edu.DTO.AvatarItemDTO;
import edu.example.edu.DTO.UserAvatarConfigDTO;
import edu.example.edu.Entity.*;
import edu.example.edu.Entity.AvatarItem.Category;
import edu.example.edu.Entity.AvatarItem.UnlockType;
import edu.example.edu.Repository.*;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;

@Service
public class AvatarService {

    @Autowired
    private AvatarItemRepository avatarItemRepository;

    @Autowired
    private UserAvatarRepository userAvatarRepository;

    @Autowired
    private UserUnlockedItemRepository userUnlockedItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CoinHistoryRepository coinHistoryRepository;

    // ──────────────────────────────────────────────
    // DATA SEEDING — Seeds cosmetic items on startup
    // ──────────────────────────────────────────────
    @PostConstruct
    public void initializeDefaultItems() {
        // If items exist with valid values, skip seeding
        if (avatarItemRepository.count() > 0) return;

        List<AvatarItem> items = new ArrayList<>();

        // 1. HAIR (top in avataaars)
        items.add(createItem(Category.HAIR, "shortFlat", "Short Hair", UnlockType.FREE, 0, 0, true));
        items.add(createItem(Category.HAIR, "longButNotTooLong", "Long Hair", UnlockType.FREE, 0, 0, false));
        items.add(createItem(Category.HAIR, "curly", "Curly Hair", UnlockType.LEVEL, 3, 0, false));
        items.add(createItem(Category.HAIR, "shaggyMullet", "Spiky Hair", UnlockType.LEVEL, 4, 0, false));
        items.add(createItem(Category.HAIR, "bigHair", "Mohawk", UnlockType.COINS, 0, 500, false));

        // 2. EYES
        items.add(createItem(Category.EYES, "happy", "Happy", UnlockType.FREE, 0, 0, true));
        items.add(createItem(Category.EYES, "default", "Default", UnlockType.FREE, 0, 0, false));
        items.add(createItem(Category.EYES, "surprised", "Surprised", UnlockType.LEVEL, 2, 0, false));
        items.add(createItem(Category.EYES, "wink", "Wink", UnlockType.LEVEL, 4, 0, false));
        items.add(createItem(Category.EYES, "squint", "Sleepy", UnlockType.COINS, 0, 300, false));

        // 3. EYEBROWS
        items.add(createItem(Category.EYEBROWS, "default", "Default", UnlockType.FREE, 0, 0, true));
        items.add(createItem(Category.EYEBROWS, "sadConcerned", "Sad", UnlockType.FREE, 0, 0, false));
        items.add(createItem(Category.EYEBROWS, "raisedExcited", "Raised", UnlockType.LEVEL, 2, 0, false));
        items.add(createItem(Category.EYEBROWS, "angry", "Angry", UnlockType.COINS, 0, 200, false));

        // 4. MOUTH
        items.add(createItem(Category.MOUTH, "smile", "Smile", UnlockType.FREE, 0, 0, true));
        items.add(createItem(Category.MOUTH, "serious", "Serious", UnlockType.FREE, 0, 0, false));
        items.add(createItem(Category.MOUTH, "eating", "Laugh", UnlockType.LEVEL, 3, 0, false));
        items.add(createItem(Category.MOUTH, "twinkle", "Open Smile", UnlockType.LEVEL, 5, 0, false));

        // 5. GLASSES
        items.add(createItem(Category.GLASSES, "none", "None", UnlockType.FREE, 0, 0, true));
        items.add(createItem(Category.GLASSES, "prescription01", "Normal Glasses", UnlockType.FREE, 0, 0, false));
        items.add(createItem(Category.GLASSES, "round", "Round Glasses", UnlockType.LEVEL, 2, 0, false));
        items.add(createItem(Category.GLASSES, "sunglasses", "Sunglasses", UnlockType.COINS, 0, 300, false));
        items.add(createItem(Category.GLASSES, "wayfarers", "Cool Shades", UnlockType.COINS, 0, 500, false));

        // 6. CLOTHES
        items.add(createItem(Category.CLOTHES, "blazerAndShirt", "College Uniform", UnlockType.FREE, 0, 0, true));
        items.add(createItem(Category.CLOTHES, "shirtVNeck", "Formal Shirt", UnlockType.FREE, 0, 0, false));
        items.add(createItem(Category.CLOTHES, "hoodie", "Hoodie", UnlockType.LEVEL, 2, 0, false));
        items.add(createItem(Category.CLOTHES, "overall", "Graduation Gown", UnlockType.LEVEL, 6, 0, false));
        items.add(createItem(Category.CLOTHES, "graphicShirt", "AI Hoodie", UnlockType.COINS, 0, 800, false));

        // 7. FRAME
        items.add(createItem(Category.FRAME, "blue", "Blue", UnlockType.FREE, 0, 0, true));
        items.add(createItem(Category.FRAME, "green", "Green", UnlockType.FREE, 0, 0, false));
        items.add(createItem(Category.FRAME, "gold", "Gold", UnlockType.LEVEL, 5, 0, false));
        items.add(createItem(Category.FRAME, "diamond", "Diamond", UnlockType.COINS, 0, 1200, false));
        items.add(createItem(Category.FRAME, "fire", "Fire", UnlockType.COINS, 0, 1500, false));

        // 8. BACKGROUND
        items.add(createItem(Category.BACKGROUND, "ffffff", "White", UnlockType.FREE, 0, 0, true));
        items.add(createItem(Category.BACKGROUND, "60a5fa", "Blue", UnlockType.FREE, 0, 0, false));
        items.add(createItem(Category.BACKGROUND, "a78bfa", "Purple", UnlockType.FREE, 0, 0, false));
        items.add(createItem(Category.BACKGROUND, "312e81", "Galaxy", UnlockType.LEVEL, 7, 0, false));
        items.add(createItem(Category.BACKGROUND, "0f172a", "AI Circuit", UnlockType.COINS, 0, 1500, false));

        avatarItemRepository.saveAll(items);
    }

    private AvatarItem createItem(Category cat, String key, String name, UnlockType unlock, int level, int coins, boolean isDefault) {
        AvatarItem item = new AvatarItem();
        item.setCategory(cat);
        item.setItemKey(key);
        item.setDisplayName(name);
        item.setUnlockType(unlock);
        item.setRequiredLevel(level);
        item.setCoinCost(coins);
        item.setIsDefault(isDefault);
        item.setIsActive(true);
        return item;
    }

    // ──────────────────────────────────────────────
    // GET CURRENT USER AVATAR CONFIGURATION
    // ──────────────────────────────────────────────
    public UserAvatarConfigDTO getCurrentAvatar(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Optional<UserAvatar> avatarOpt = userAvatarRepository.findByUserId(userId);

        UserAvatar userAvatar;
        if (avatarOpt.isPresent()) {
            userAvatar = avatarOpt.get();
        } else {
            // Auto-create default avatar
            userAvatar = new UserAvatar();
            userAvatar.setUserId(userId);
            userAvatar.setHair("shortFlat");
            userAvatar.setEyes("happy");
            userAvatar.setEyebrows("default");
            userAvatar.setMouth("smile");
            userAvatar.setGlasses("none");
            userAvatar.setClothes("blazerAndShirt");
            userAvatar.setFrame("blue");
            userAvatar.setBackground("ffffff");
            userAvatar.setSeed(user.getName() != null ? user.getName() : String.valueOf(userId));
            userAvatar.setCreatedAt(LocalDateTime.now());
            userAvatar.setUpdatedAt(LocalDateTime.now());
            userAvatar = userAvatarRepository.save(userAvatar);
        }

        UserAvatarConfigDTO dto = new UserAvatarConfigDTO();
        dto.setHair(userAvatar.getHair() != null ? userAvatar.getHair() : "shortFlat");
        dto.setEyes(userAvatar.getEyes() != null ? userAvatar.getEyes() : "happy");
        dto.setEyebrows(userAvatar.getEyebrows() != null ? userAvatar.getEyebrows() : "default");
        dto.setMouth(userAvatar.getMouth() != null ? userAvatar.getMouth() : "smile");
        dto.setGlasses(userAvatar.getGlasses() != null ? userAvatar.getGlasses() : "none");
        dto.setClothes(userAvatar.getClothes() != null ? userAvatar.getClothes() : "blazerAndShirt");
        dto.setFrame(userAvatar.getFrame() != null ? userAvatar.getFrame() : "blue");
        dto.setBackground(userAvatar.getBackground() != null ? userAvatar.getBackground() : "ffffff");
        dto.setSeed(userAvatar.getSeed() != null ? userAvatar.getSeed() : user.getName());
        return dto;
    }

    // ──────────────────────────────────────────────
    // GET ALL COSMETIC ITEMS GROUPED / ANNOTATED
    // ──────────────────────────────────────────────
    public Map<String, List<AvatarItemDTO>> getAllItemsGrouped(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        int userLevel = user.getCurrentLevel() != null ? user.getCurrentLevel() : 1;
        UserAvatarConfigDTO currentConfig = getCurrentAvatar(userId);

        Set<Long> unlockedIds = userUnlockedItemRepository.findByUserId(userId)
                .stream().map(UserUnlockedItem::getAvatarItemId).collect(Collectors.toSet());

        List<AvatarItem> allItems = avatarItemRepository.findByIsActiveTrue();
        Map<String, List<AvatarItemDTO>> result = new LinkedHashMap<>();

        for (AvatarItem item : allItems) {
            AvatarItemDTO dto = new AvatarItemDTO();
            dto.setId(item.getId());
            dto.setCategory(item.getCategory().name());
            dto.setItemKey(item.getItemKey());
            dto.setDisplayName(item.getDisplayName());
            dto.setUnlockType(item.getUnlockType().name());
            dto.setRequiredLevel(item.getRequiredLevel());
            dto.setCoinCost(item.getCoinCost());
            dto.setIsDefault(item.getIsDefault());

            boolean unlocked = false;
            String lockedReason = null;

            if (item.getIsDefault() || item.getUnlockType() == UnlockType.FREE) {
                unlocked = true;
            } else if (unlockedIds.contains(item.getId())) {
                unlocked = true;
            } else if (item.getUnlockType() == UnlockType.LEVEL) {
                if (userLevel >= item.getRequiredLevel()) {
                    unlocked = true;
                    // Auto-record unlock
                    recordUnlock(userId, item.getId());
                } else {
                    lockedReason = "Reach Level " + item.getRequiredLevel();
                }
            } else if (item.getUnlockType() == UnlockType.COINS) {
                lockedReason = "Costs " + item.getCoinCost() + " Coins";
            }

            dto.setUnlocked(unlocked);
            dto.setLockedReason(lockedReason);

            // Check if currently equipped
            boolean equipped = isItemEquipped(currentConfig, item.getCategory(), item.getItemKey());
            dto.setEquipped(equipped);

            String catKey = item.getCategory().name();
            result.computeIfAbsent(catKey, k -> new ArrayList<>()).add(dto);
        }

        return result;
    }

    private boolean isItemEquipped(UserAvatarConfigDTO config, Category category, String itemKey) {
        switch (category) {
            case HAIR: return itemKey.equalsIgnoreCase(config.getHair());
            case EYES: return itemKey.equalsIgnoreCase(config.getEyes());
            case EYEBROWS: return itemKey.equalsIgnoreCase(config.getEyebrows());
            case MOUTH: return itemKey.equalsIgnoreCase(config.getMouth());
            case GLASSES: return itemKey.equalsIgnoreCase(config.getGlasses());
            case CLOTHES: return itemKey.equalsIgnoreCase(config.getClothes());
            case FRAME: return itemKey.equalsIgnoreCase(config.getFrame());
            case BACKGROUND: return itemKey.equalsIgnoreCase(config.getBackground());
            default: return false;
        }
    }

    // ──────────────────────────────────────────────
    // SAVE FULL AVATAR CONFIGURATION
    // ──────────────────────────────────────────────
    @Transactional
    public UserAvatarConfigDTO saveAvatarConfig(Long userId, UserAvatarConfigDTO configDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Optional<UserAvatar> avatarOpt = userAvatarRepository.findByUserId(userId);
        UserAvatar userAvatar = avatarOpt.orElseGet(() -> {
            UserAvatar ua = new UserAvatar();
            ua.setUserId(userId);
            ua.setCreatedAt(LocalDateTime.now());
            return ua;
        });

        if (configDTO.getHair() != null) userAvatar.setHair(configDTO.getHair());
        if (configDTO.getEyes() != null) userAvatar.setEyes(configDTO.getEyes());
        if (configDTO.getEyebrows() != null) userAvatar.setEyebrows(configDTO.getEyebrows());
        if (configDTO.getMouth() != null) userAvatar.setMouth(configDTO.getMouth());
        if (configDTO.getGlasses() != null) userAvatar.setGlasses(configDTO.getGlasses());
        if (configDTO.getClothes() != null) userAvatar.setClothes(configDTO.getClothes());
        if (configDTO.getFrame() != null) userAvatar.setFrame(configDTO.getFrame());
        if (configDTO.getBackground() != null) userAvatar.setBackground(configDTO.getBackground());
        userAvatar.setSeed(user.getName() != null ? user.getName() : String.valueOf(userId));
        userAvatar.setUpdatedAt(LocalDateTime.now());

        userAvatarRepository.save(userAvatar);
        return getCurrentAvatar(userId);
    }

    // ──────────────────────────────────────────────
    // BUY COSMETIC ITEM WITH COINS
    // ──────────────────────────────────────────────
    @Transactional
    public String buyItem(Long userId, Long itemId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        AvatarItem item = avatarItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Avatar item not found: " + itemId));

        if (userUnlockedItemRepository.existsByUserIdAndAvatarItemId(userId, itemId)) {
            return "Item already unlocked";
        }

        if (item.getUnlockType() != UnlockType.COINS) {
            return "This item cannot be purchased with coins";
        }

        int userCoins = user.getCoins() != null ? user.getCoins() : 0;
        if (userCoins < item.getCoinCost()) {
            return "Not enough coins";
        }

        // Deduct coins
        user.setCoins(userCoins - item.getCoinCost());
        userRepository.save(user);

        // Record CoinHistory
        CoinHistory history = new CoinHistory();
        history.setUser(user);
        history.setActivity("Purchased " + item.getDisplayName());
        history.setCoinsEarned(-item.getCoinCost());
        history.setCreatedAt(LocalDateTime.now());
        coinHistoryRepository.save(history);

        // Record unlock
        recordUnlock(userId, itemId);

        // Equip immediately
        equipSingleItem(userId, item.getCategory(), item.getItemKey());

        return "Purchased and equipped " + item.getDisplayName() + "!";
    }

    // ──────────────────────────────────────────────
    // EQUIP AN UNLOCKED COSMETIC ITEM
    // ──────────────────────────────────────────────
    @Transactional
    public String equipItem(Long userId, String categoryStr, String itemKey) {
        Category category = Category.valueOf(categoryStr.toUpperCase());

        AvatarItem item = avatarItemRepository.findByCategoryAndItemKey(category, itemKey)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean unlocked = item.getIsDefault()
                || item.getUnlockType() == UnlockType.FREE
                || userUnlockedItemRepository.existsByUserIdAndAvatarItemId(userId, item.getId())
                || (item.getUnlockType() == UnlockType.LEVEL && (user.getCurrentLevel() != null ? user.getCurrentLevel() : 1) >= item.getRequiredLevel());

        if (!unlocked) {
            return "Item is locked";
        }

        equipSingleItem(userId, category, itemKey);
        return "Equipped " + item.getDisplayName();
    }

    private void equipSingleItem(Long userId, Category category, String itemKey) {
        UserAvatar userAvatar = userAvatarRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserAvatar ua = new UserAvatar();
                    ua.setUserId(userId);
                    ua.setSeed(String.valueOf(userId));
                    ua.setCreatedAt(LocalDateTime.now());
                    return ua;
                });

        switch (category) {
            case HAIR: userAvatar.setHair(itemKey); break;
            case EYES: userAvatar.setEyes(itemKey); break;
            case EYEBROWS: userAvatar.setEyebrows(itemKey); break;
            case MOUTH: userAvatar.setMouth(itemKey); break;
            case GLASSES: userAvatar.setGlasses(itemKey); break;
            case CLOTHES: userAvatar.setClothes(itemKey); break;
            case FRAME: userAvatar.setFrame(itemKey); break;
            case BACKGROUND: userAvatar.setBackground(itemKey); break;
        }
        userAvatar.setUpdatedAt(LocalDateTime.now());
        userAvatarRepository.save(userAvatar);
    }

    // ──────────────────────────────────────────────
    // AUTO-UNLOCK COSMETIC ITEMS ON LEVEL-UP
    // ──────────────────────────────────────────────
    @Transactional
    public List<String> autoUnlockOnLevelUp(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return List.of();

        int userLevel = user.getCurrentLevel() != null ? user.getCurrentLevel() : 1;
        List<AvatarItem> levelItems = avatarItemRepository.findByIsActiveTrue().stream()
                .filter(i -> i.getUnlockType() == UnlockType.LEVEL && userLevel >= i.getRequiredLevel())
                .collect(Collectors.toList());

        List<String> newlyUnlocked = new ArrayList<>();
        for (AvatarItem item : levelItems) {
            if (!userUnlockedItemRepository.existsByUserIdAndAvatarItemId(userId, item.getId())) {
                recordUnlock(userId, item.getId());
                newlyUnlocked.add(item.getDisplayName());
            }
        }
        return newlyUnlocked;
    }

    private void recordUnlock(Long userId, Long avatarItemId) {
        if (userUnlockedItemRepository.existsByUserIdAndAvatarItemId(userId, avatarItemId)) return;
        UserUnlockedItem unlock = new UserUnlockedItem();
        unlock.setUserId(userId);
        unlock.setAvatarItemId(avatarItemId);
        unlock.setUnlockedAt(LocalDateTime.now());
        userUnlockedItemRepository.save(unlock);
    }
}
