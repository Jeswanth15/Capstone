package edu.example.edu.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.example.edu.DTO.GamificationStatusDTO;
import edu.example.edu.Entity.CoinHistory;
import edu.example.edu.Entity.User;
import edu.example.edu.Entity.XPHistory;
import edu.example.edu.Repository.CoinHistoryRepository;
import edu.example.edu.Repository.UserRepository;
import edu.example.edu.Repository.XPHistoryRepository;
import jakarta.transaction.Transactional;

@Service
public class GamificationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private XPHistoryRepository xpHistoryRepository;

    @Autowired
    private CoinHistoryRepository coinHistoryRepository;

    @Autowired
    private AvatarService avatarService;

    private static final int[] LEVEL_THRESHOLDS = { 0, 250, 600, 1200, 2000, 3500, 5000 };
    private static final String[] LEVEL_NAMES = { "Beginner", "Learner", "Explorer", "Scholar", "Expert", "Master", "Grandmaster" };

    @Transactional
    public GamificationStatusDTO getGamificationStatus(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        User user = userOpt.get();

        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDate lastLogin = user.getLastLoginDate();

        boolean isFirstLoginToday = false;
        int dailyXp = 0;
        int dailyCoins = 0;

        if (lastLogin == null) {
            user.setCurrentStreak(1);
            user.setLastLoginDate(today);
            isFirstLoginToday = true;
            dailyXp = 50;
            dailyCoins = 25;
        } else if (lastLogin.equals(today.minusDays(1))) {
            int newStreak = (user.getCurrentStreak() != null ? user.getCurrentStreak() : 0) + 1;
            user.setCurrentStreak(newStreak);
            user.setLastLoginDate(today);
            isFirstLoginToday = true;
            dailyXp = 50 + Math.min(newStreak * 5, 50);
            dailyCoins = 25 + Math.min(newStreak * 2, 25);
        } else if (lastLogin.isBefore(today.minusDays(1))) {
            user.setCurrentStreak(1);
            user.setLastLoginDate(today);
            isFirstLoginToday = true;
            dailyXp = 50;
            dailyCoins = 25;
        } else {
            isFirstLoginToday = false;
        }

        if (isFirstLoginToday) {
            user.setTotalXp((user.getTotalXp() != null ? user.getTotalXp() : 0) + dailyXp);
            user.setCurrentLevel(calculateLevel(user.getTotalXp()));
            user.setCoins((user.getCoins() != null ? user.getCoins() : 0) + dailyCoins);
            userRepository.save(user);

            XPHistory xpHistory = new XPHistory();
            xpHistory.setUser(user);
            xpHistory.setActivity("Daily Login Streak (" + user.getCurrentStreak() + " Days)");
            xpHistory.setXpEarned(dailyXp);
            xpHistory.setCreatedAt(LocalDateTime.now());
            xpHistoryRepository.save(xpHistory);

            CoinHistory coinHistory = new CoinHistory();
            coinHistory.setUser(user);
            coinHistory.setActivity("Daily Login Streak (" + user.getCurrentStreak() + " Days)");
            coinHistory.setCoinsEarned(dailyCoins);
            coinHistory.setCreatedAt(LocalDateTime.now());
            coinHistoryRepository.save(coinHistory);
        }

        GamificationStatusDTO dto = new GamificationStatusDTO();
        dto.setTotalXp(user.getTotalXp() != null ? user.getTotalXp() : 0);
        dto.setCurrentLevel(user.getCurrentLevel() != null ? user.getCurrentLevel() : 1);
        dto.setCoins(user.getCoins() != null ? user.getCoins() : 0);
        dto.setLevelName(getLevelName(dto.getCurrentLevel()));
        dto.setNextLevelXpThreshold(getNextLevelThreshold(dto.getCurrentLevel()));
        dto.setCurrentStreak(user.getCurrentStreak() != null ? user.getCurrentStreak() : 1);
        dto.setIsFirstLoginToday(isFirstLoginToday);
        dto.setDailyXpEarned(dailyXp);
        dto.setDailyCoinsEarned(dailyCoins);
        return dto;
    }

    private String getLevelName(int level) {
        if (level < 1) return LEVEL_NAMES[0];
        if (level > 7) return LEVEL_NAMES[6];
        return LEVEL_NAMES[level - 1];
    }

    private int getNextLevelThreshold(int currentLevel) {
        if (currentLevel >= 7) return LEVEL_THRESHOLDS[6];
        return LEVEL_THRESHOLDS[currentLevel];
    }

    private int calculateLevel(int totalXp) {
        for (int i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if (totalXp >= LEVEL_THRESHOLDS[i]) {
                return i + 1;
            }
        }
        return 1;
    }

    @Transactional
    public boolean awardXP(Long userId, String activity) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return false;
        User user = userOpt.get();

        // Prevent duplicate XP rewards for the same specific activity instance
        // Assuming activity string includes unique identifier if needed (e.g. "LessonCompleted_123")
        if (xpHistoryRepository.existsByUser_UserIdAndActivity(userId, activity)) {
            return false;
        }

        int xpToAward = 0;
        int coinsToAward = 0;

        if (activity.startsWith("Lesson Completed")) {
            xpToAward = 20;
            coinsToAward = 5;
        } else if (activity.startsWith("Daily Challenge")) {
            // Daily Challenge is the primary AI quiz — grant highest reward
            xpToAward = 100;
            coinsToAward = 30;
        } else if (activity.startsWith("Quiz Completed")) {
            // AI Practice test (ad-hoc)
            xpToAward = 50;
            coinsToAward = 15;
        } else if (activity.startsWith("Mock Test Completed")) {
            xpToAward = 100;
            coinsToAward = 30;
        } else if (activity.startsWith("Daily Login")) {
            xpToAward = 10;
            coinsToAward = 5;
        } else if (activity.startsWith("Daily Champion")) {
            // Bonus for completing all daily missions
            xpToAward = 100;
            coinsToAward = 50;
        } else if (activity.startsWith("Weekly Warrior")) {
            // Bonus for completing all weekly challenges
            xpToAward = 500;
            coinsToAward = 250;
        } else {
            return false;
        }

        int currentTotal = user.getTotalXp() != null ? user.getTotalXp() : 0;
        int previousLevel = user.getCurrentLevel() != null ? user.getCurrentLevel() : 1;
        user.setTotalXp(currentTotal + xpToAward);
        user.setCurrentLevel(calculateLevel(user.getTotalXp()));

        int currentCoins = user.getCoins() != null ? user.getCoins() : 0;
        user.setCoins(currentCoins + coinsToAward);
        
        userRepository.save(user);

        // Auto-unlock avatar styles on level-up
        if (user.getCurrentLevel() > previousLevel) {
            try {
                avatarService.autoUnlockOnLevelUp(userId);
            } catch (Exception e) {
                // Don't let avatar unlock failure break XP awarding
                System.err.println("Avatar auto-unlock error: " + e.getMessage());
            }
        }

        XPHistory xpHistory = new XPHistory();
        xpHistory.setUser(user);
        xpHistory.setActivity(activity);
        xpHistory.setXpEarned(xpToAward);
        xpHistory.setCreatedAt(LocalDateTime.now());
        xpHistoryRepository.save(xpHistory);

        CoinHistory coinHistory = new CoinHistory();
        coinHistory.setUser(user);
        coinHistory.setActivity(activity);
        coinHistory.setCoinsEarned(coinsToAward);
        coinHistory.setCreatedAt(LocalDateTime.now());
        coinHistoryRepository.save(coinHistory);

        return true;
    }

    public List<XPHistory> getXpHistory(Long userId) {
        return xpHistoryRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);
    }

    public List<CoinHistory> getCoinHistory(Long userId) {
        return coinHistoryRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);
    }
}
