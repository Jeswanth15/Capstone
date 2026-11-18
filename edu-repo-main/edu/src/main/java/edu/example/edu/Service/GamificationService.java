package edu.example.edu.Service;

import edu.example.edu.DTO.BadgeDTO;
import edu.example.edu.DTO.UserGamificationProfileDTO;
import edu.example.edu.Entity.*;
import edu.example.edu.Repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GamificationService {

    private final UserRepository userRepository;
    private final XPHistoryRepository xpHistoryRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final TeamStudentParticipationRepository participationRepository;

    public GamificationService(
            UserRepository userRepository,
            XPHistoryRepository xpHistoryRepository,
            UserBadgeRepository userBadgeRepository,
            TeamStudentParticipationRepository participationRepository
    ) {
        this.userRepository = userRepository;
        this.xpHistoryRepository = xpHistoryRepository;
        this.userBadgeRepository = userBadgeRepository;
        this.participationRepository = participationRepository;
    }

    public static final int BASE_PARTICIPATION_XP = 20;
    public static final int WINNING_TEAM_BONUS_XP = 30;

    public int calculateXpForChallenge(int score, boolean isWinner) {
        int performanceXp = score; // 1 XP per percentage point
        int total = BASE_PARTICIPATION_XP + performanceXp;
        if (isWinner) {
            total += WINNING_TEAM_BONUS_XP;
        }
        return total;
    }

    @Transactional
    public List<BadgeDTO> awardXpAndEvaluateBadges(User student, TeamChallengeResult result, boolean isWinner) {
        Long studentId = student.getUserId();
        String activityTag = "CHALLENGE_SESSION_" + result.getSession().getId();

        // Idempotency check: Ensure XP for this session isn't awarded twice to the student
        boolean alreadyAwarded = xpHistoryRepository.existsByUser_UserIdAndActivity(studentId, activityTag);

        int xpToEarn = calculateXpForChallenge(result.getScore(), isWinner);

        if (!alreadyAwarded) {
            XPHistory xp = new XPHistory();
            xp.setUser(student);
            xp.setActivity(activityTag);
            xp.setXpEarned(xpToEarn);
            xp.setCreatedAt(LocalDateTime.now());
            xpHistoryRepository.save(xp);

            int newTotalXp = (student.getTotalXp() != null ? student.getTotalXp() : 0) + xpToEarn;
            student.setTotalXp(newTotalXp);
            
            int newLevel = (newTotalXp / 100) + 1;
            student.setCurrentLevel(newLevel);
            userRepository.save(student);
        }

        // Evaluate and award badges idempotently
        List<UserBadge> newBadges = new ArrayList<>();
        List<TeamStudentParticipation> participations = participationRepository.findByStudent_UserId(studentId);
        int completedCount = participations.size();

        // 1. FIRST_CHALLENGE
        if (completedCount >= 1) {
            awardBadgeIfAbsent(student, "FIRST_CHALLENGE", "First Victory", "Completed your 1st team challenge!", "🏆", "Complete 1 team challenge", newBadges);
        }

        // 2. TEAM_PLAYER
        if (completedCount >= 3) {
            awardBadgeIfAbsent(student, "TEAM_PLAYER", "Team Player", "Participated in 3+ team challenges with your squad!", "🤝", "Complete 3 team challenges", newBadges);
        }

        // 3. TOP_SCORER
        if (result.getScore() >= 90) {
            awardBadgeIfAbsent(student, "TOP_SCORER", "Top Scorer", "Achieved 90%+ in a team challenge!", "🎯", "Score 90% or higher", newBadges);
        }

        // 4. CHALLENGE_WINNER
        if (isWinner) {
            awardBadgeIfAbsent(student, "CHALLENGE_WINNER", "Territory Conqueror", "Member of the winning team in a challenge!", "🏰", "Win a team challenge", newBadges);
        }

        // 5. CONSISTENT_PLAYER
        if (completedCount >= 5 || (student.getCurrentStreak() != null && student.getCurrentStreak() >= 3)) {
            awardBadgeIfAbsent(student, "CONSISTENT_PLAYER", "Unstoppable Streak", "Completed 5+ challenges or maintained a 3-day active streak!", "🔥", "Complete 5 challenges or 3-day streak", newBadges);
        }

        // 6. MODULE_MASTER
        if (Boolean.TRUE.equals(result.getIsModuleCaptured())) {
            awardBadgeIfAbsent(student, "MODULE_MASTER", "Module Master", "Successfully captured control of a module territory!", "👑", "Capture a module territory", newBadges);
        }

        return newBadges.stream().map(this::toBadgeDTO).collect(Collectors.toList());
    }

    private void awardBadgeIfAbsent(User user, String code, String name, String desc, String icon, String criteria, List<UserBadge> newBadges) {
        if (!userBadgeRepository.existsByUser_UserIdAndBadgeCode(user.getUserId(), code)) {
            UserBadge b = new UserBadge();
            b.setUser(user);
            b.setBadgeCode(code);
            b.setBadgeName(name);
            b.setDescription(desc);
            b.setIcon(icon);
            b.setCriteria(criteria);
            b.setEarnedAt(LocalDateTime.now());
            userBadgeRepository.save(b);
            newBadges.add(b);
        }
    }

    public UserGamificationProfileDTO getUserProfile(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        int totalXp = user.getTotalXp() != null ? user.getTotalXp() : 0;
        int level = (totalXp / 100) + 1;
        int xpForNext = level * 100;
        double progress = (totalXp % 100);

        List<UserBadge> badges = userBadgeRepository.findByUser_UserId(userId);
        List<BadgeDTO> badgeDTOs = badges.stream().map(this::toBadgeDTO).collect(Collectors.toList());
        int challengesCount = participationRepository.findByStudent_UserId(userId).size();

        return new UserGamificationProfileDTO(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                totalXp,
                level,
                xpForNext,
                progress,
                user.getCoins() != null ? user.getCoins() : 0,
                user.getCurrentStreak() != null ? user.getCurrentStreak() : 1,
                user.getEquippedNickname(),
                badgeDTOs,
                challengesCount
        );
    }

    public BadgeDTO toBadgeDTO(UserBadge b) {
        return new BadgeDTO(
                b.getBadgeCode(),
                b.getBadgeName(),
                b.getDescription(),
                b.getIcon(),
                b.getCriteria(),
                b.getEarnedAt()
        );
    }

    @Transactional
    public boolean awardXP(Long userId, String activityTag) {
        return awardXP(userId, 50, activityTag);
    }

    @Transactional
    public boolean awardXP(Long userId, int xpAmount, String activityTag) {
        if (xpHistoryRepository.existsByUser_UserIdAndActivity(userId, activityTag)) {
            return false;
        }
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return false;

        XPHistory xp = new XPHistory();
        xp.setUser(user);
        xp.setActivity(activityTag);
        xp.setXpEarned(xpAmount);
        xp.setCreatedAt(LocalDateTime.now());
        xpHistoryRepository.save(xp);

        int newTotalXp = (user.getTotalXp() != null ? user.getTotalXp() : 0) + xpAmount;
        user.setTotalXp(newTotalXp);
        user.setCurrentLevel((newTotalXp / 100) + 1);
        userRepository.save(user);

        return true;
    }
}
