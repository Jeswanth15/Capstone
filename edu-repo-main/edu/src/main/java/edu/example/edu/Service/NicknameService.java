package edu.example.edu.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.example.edu.DTO.NicknameDTO;
import edu.example.edu.Entity.Attendance;
import edu.example.edu.Entity.Nickname;
import edu.example.edu.Entity.User;
import edu.example.edu.Entity.UserNickname;
import edu.example.edu.Entity.XPHistory;
import edu.example.edu.Repository.AttendanceRepository;
import edu.example.edu.Repository.NicknameRepository;
import edu.example.edu.Repository.PracticeHistoryRepository;
import edu.example.edu.Repository.SubmissionRepository;
import edu.example.edu.Repository.UserNicknameRepository;
import edu.example.edu.Repository.UserRepository;
import edu.example.edu.Repository.XPHistoryRepository;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;

@Service
public class NicknameService {

    @Autowired
    private NicknameRepository nicknameRepository;

    @Autowired
    private UserNicknameRepository userNicknameRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private XPHistoryRepository xpHistoryRepository;

    @Autowired
    private PracticeHistoryRepository practiceHistoryRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @PostConstruct
    @Transactional
    public void initNicknames() {
        // Simple demo constraints for easy unlocking
        List<Nickname> defaults = new ArrayList<>();

        // LOGIN STREAK (Simple Demo: 1, 2, 3, 5, 7)
        defaults.add(new Nickname(null, "Early Bird", "Login to platform 1 day", Nickname.Category.LOGIN, "LOGIN_STREAK", 1, "🌅", Nickname.Rarity.COMMON));
        defaults.add(new Nickname(null, "Consistent Learner", "Login to platform 2 days", Nickname.Category.LOGIN, "LOGIN_STREAK", 2, "🔥", Nickname.Rarity.UNCOMMON));
        defaults.add(new Nickname(null, "Learning Legend", "Login to platform 3 days", Nickname.Category.LOGIN, "LOGIN_STREAK", 3, "⭐", Nickname.Rarity.RARE));
        defaults.add(new Nickname(null, "Unstoppable", "Login to platform 5 days", Nickname.Category.LOGIN, "LOGIN_STREAK", 5, "⚡", Nickname.Rarity.EPIC));
        defaults.add(new Nickname(null, "Iron Will", "Login to platform 7 days", Nickname.Category.LOGIN, "LOGIN_STREAK", 7, "👑", Nickname.Rarity.LEGENDARY));

        // AI MOCK TESTS (Simple Demo: 1, 2, 3, 5, 10)
        defaults.add(new Nickname(null, "AI Explorer", "Complete 1 AI Mock Test", Nickname.Category.MOCK_TEST, "MOCK_TEST_COUNT", 1, "🤖", Nickname.Rarity.COMMON));
        defaults.add(new Nickname(null, "AI Apprentice", "Complete 2 AI Mock Tests", Nickname.Category.MOCK_TEST, "MOCK_TEST_COUNT", 2, "🧠", Nickname.Rarity.UNCOMMON));
        defaults.add(new Nickname(null, "AI Strategist", "Complete 3 AI Mock Tests", Nickname.Category.MOCK_TEST, "MOCK_TEST_COUNT", 3, "🎯", Nickname.Rarity.RARE));
        defaults.add(new Nickname(null, "AI Master", "Complete 5 AI Mock Tests", Nickname.Category.MOCK_TEST, "MOCK_TEST_COUNT", 5, "🚀", Nickname.Rarity.EPIC));
        defaults.add(new Nickname(null, "AI Grandmaster", "Complete 10 AI Mock Tests", Nickname.Category.MOCK_TEST, "MOCK_TEST_COUNT", 10, "👑", Nickname.Rarity.LEGENDARY));

        // ATTENDANCE (Simple Demo: 1, 2, 3, 5, 10)
        defaults.add(new Nickname(null, "Dedicated Student", "Attend 1 Class", Nickname.Category.ATTENDANCE, "ATTENDANCE_COUNT", 1, "🎒", Nickname.Rarity.COMMON));
        defaults.add(new Nickname(null, "Campus Regular", "Attend 2 Classes", Nickname.Category.ATTENDANCE, "ATTENDANCE_COUNT", 2, "🏫", Nickname.Rarity.UNCOMMON));
        defaults.add(new Nickname(null, "Perfect Attendee", "Attend 3 Classes", Nickname.Category.ATTENDANCE, "ATTENDANCE_COUNT", 3, "🌟", Nickname.Rarity.RARE));
        defaults.add(new Nickname(null, "Attendance Champion", "Attend 5 Classes", Nickname.Category.ATTENDANCE, "ATTENDANCE_COUNT", 5, "🛡", Nickname.Rarity.EPIC));
        defaults.add(new Nickname(null, "Attendance Legend", "Attend 10 Classes", Nickname.Category.ATTENDANCE, "ATTENDANCE_COUNT", 10, "👑", Nickname.Rarity.LEGENDARY));

        // ASSIGNMENTS (Simple Demo: 1, 2, 3, 5, 10)
        defaults.add(new Nickname(null, "Assignment Starter", "Complete 1 Assignment", Nickname.Category.ASSIGNMENT, "ASSIGNMENT_COUNT", 1, "📝", Nickname.Rarity.COMMON));
        defaults.add(new Nickname(null, "Deadline Keeper", "Complete 2 Assignments", Nickname.Category.ASSIGNMENT, "ASSIGNMENT_COUNT", 2, "📂", Nickname.Rarity.UNCOMMON));
        defaults.add(new Nickname(null, "Assignment Expert", "Complete 3 Assignments", Nickname.Category.ASSIGNMENT, "ASSIGNMENT_COUNT", 3, "📚", Nickname.Rarity.RARE));
        defaults.add(new Nickname(null, "Assignment Hero", "Complete 5 Assignments", Nickname.Category.ASSIGNMENT, "ASSIGNMENT_COUNT", 5, "💯", Nickname.Rarity.EPIC));
        defaults.add(new Nickname(null, "Submission Legend", "Complete 10 Assignments", Nickname.Category.ASSIGNMENT, "ASSIGNMENT_COUNT", 10, "👑", Nickname.Rarity.LEGENDARY));

        // XP (Simple Demo: 10, 50, 100, 250, 500 XP)
        defaults.add(new Nickname(null, "Rising Star", "Reach 10 XP", Nickname.Category.XP, "XP_REACHED", 10, "⭐", Nickname.Rarity.COMMON));
        defaults.add(new Nickname(null, "XP Explorer", "Reach 50 XP", Nickname.Category.XP, "XP_REACHED", 50, "🚀", Nickname.Rarity.UNCOMMON));
        defaults.add(new Nickname(null, "XP Champion", "Reach 100 XP", Nickname.Category.XP, "XP_REACHED", 100, "🏆", Nickname.Rarity.RARE));
        defaults.add(new Nickname(null, "XP Titan", "Reach 250 XP", Nickname.Category.XP, "XP_REACHED", 250, "💎", Nickname.Rarity.EPIC));
        defaults.add(new Nickname(null, "Grand Scholar", "Reach 500 XP", Nickname.Category.XP, "XP_REACHED", 500, "👑", Nickname.Rarity.LEGENDARY));

        // COINS (Simple Demo: 5, 10, 25, 50, 100 Coins)
        defaults.add(new Nickname(null, "Coin Collector", "Earn 5 Coins", Nickname.Category.COIN, "COIN_EARNED", 5, "💰", Nickname.Rarity.COMMON));
        defaults.add(new Nickname(null, "Treasure Hunter", "Earn 10 Coins", Nickname.Category.COIN, "COIN_EARNED", 10, "💎", Nickname.Rarity.UNCOMMON));
        defaults.add(new Nickname(null, "Wealth Builder", "Earn 25 Coins", Nickname.Category.COIN, "COIN_EARNED", 25, "🏦", Nickname.Rarity.RARE));
        defaults.add(new Nickname(null, "Coin King", "Earn 50 Coins", Nickname.Category.COIN, "COIN_EARNED", 50, "👑", Nickname.Rarity.EPIC));
        defaults.add(new Nickname(null, "Fortune Master", "Earn 100 Coins", Nickname.Category.COIN, "COIN_EARNED", 100, "💸", Nickname.Rarity.LEGENDARY));

        // SPECIAL (Simple Demo requirements)
        defaults.add(new Nickname(null, "Model Student", "1 Login + 1 Class Attendance", Nickname.Category.SPECIAL, "MODEL_STUDENT", 1, "🏅", Nickname.Rarity.EPIC));
        defaults.add(new Nickname(null, "AI Scholar", "1 AI Test + 10 XP", Nickname.Category.SPECIAL, "AI_SCHOLAR", 1, "🤖", Nickname.Rarity.EPIC));
        defaults.add(new Nickname(null, "Academic Achiever", "1 Assignment + 1 Class Attendance", Nickname.Category.SPECIAL, "ACADEMIC_ACHIEVER", 1, "🎓", Nickname.Rarity.LEGENDARY));
        defaults.add(new Nickname(null, "Mission Master", "Complete 1 Daily Mission", Nickname.Category.SPECIAL, "MISSION_MASTER", 1, "🎯", Nickname.Rarity.LEGENDARY));
        defaults.add(new Nickname(null, "Challenge Conqueror", "Complete 1 Weekly Challenge", Nickname.Category.SPECIAL, "CHALLENGE_CONQUEROR", 1, "🛡", Nickname.Rarity.LEGENDARY));
        defaults.add(new Nickname(null, "Campus Legend", "Reach Level 2", Nickname.Category.SPECIAL, "MAX_LEVEL", 2, "👑", Nickname.Rarity.MYTHIC));
        defaults.add(new Nickname(null, "Hall of Fame", "Unlock 3 Achievements", Nickname.Category.SPECIAL, "HALL_OF_FAME", 3, "🌟", Nickname.Rarity.MYTHIC));

        for (Nickname item : defaults) {
            Optional<Nickname> existing = nicknameRepository.findByTitle(item.getTitle());
            if (existing.isPresent()) {
                Nickname n = existing.get();
                n.setRequirementValue(item.getRequirementValue());
                n.setDescription(item.getDescription());
                nicknameRepository.save(n);
            } else {
                nicknameRepository.save(item);
            }
        }
    }

    public List<NicknameDTO> getNicknamesForUser(Long userId) {
        checkAndUnlockNicknames(userId);

        List<Nickname> allNicknames = nicknameRepository.findAll();
        List<UserNickname> userNicknames = userNicknameRepository.findByUserId(userId);

        Set<Long> unlockedIds = userNicknames.stream()
                .map(un -> un.getNickname().getId())
                .collect(Collectors.toSet());

        Long equippedNicknameId = userNicknames.stream()
                .filter(UserNickname::getIsEquipped)
                .map(un -> un.getNickname().getId())
                .findFirst()
                .orElse(null);

        User user = userRepository.findById(userId).orElse(null);
        int loginStreak = getLoginDaysCount(userId);
        int mockTests = (int) practiceHistoryRepository.countByUserIdAndTimestampBetween(userId, LocalDateTime.of(2000, 1, 1, 0, 0), LocalDateTime.now());
        int attendance = user != null ? attendanceRepository.findByStudent_UserId(userId).size() : 0;
        int assignments = user != null ? submissionRepository.findByStudent_UserId(userId).size() : 0;
        int xp = user != null && user.getTotalXp() != null ? user.getTotalXp() : 0;
        int coins = user != null && user.getCoins() != null ? user.getCoins() : 0;
        int level = user != null && user.getCurrentLevel() != null ? user.getCurrentLevel() : 1;

        List<NicknameDTO> result = new ArrayList<>();
        for (Nickname n : allNicknames) {
            NicknameDTO dto = new NicknameDTO();
            dto.setId(n.getId());
            dto.setTitle(n.getTitle());
            dto.setDescription(n.getDescription());
            dto.setCategory(n.getCategory().name());
            dto.setUnlockType(n.getUnlockType());
            dto.setRequirementValue(n.getRequirementValue());
            dto.setIcon(n.getIcon());
            dto.setRarity(n.getRarity().name());

            boolean isUnlocked = unlockedIds.contains(n.getId());
            dto.setUnlocked(isUnlocked);
            dto.setEquipped(equippedNicknameId != null && equippedNicknameId.equals(n.getId()));

            UserNickname un = userNicknames.stream().filter(x -> x.getNickname().getId().equals(n.getId())).findFirst().orElse(null);
            if (un != null) {
                dto.setUnlockedAt(un.getUnlockedAt());
            }

            // Calculate current progress
            int progress = 0;
            switch (n.getUnlockType()) {
                case "LOGIN_STREAK" -> progress = loginStreak;
                case "MOCK_TEST_COUNT" -> progress = mockTests;
                case "ATTENDANCE_COUNT" -> progress = attendance;
                case "ASSIGNMENT_COUNT" -> progress = assignments;
                case "XP_REACHED" -> progress = xp;
                case "COIN_EARNED" -> progress = coins;
                case "MAX_LEVEL" -> progress = level;
                default -> progress = isUnlocked ? n.getRequirementValue() : 0;
            }
            dto.setCurrentProgress(Math.min(progress, n.getRequirementValue()));

            result.add(dto);
        }

        return result;
    }

    @Transactional
    public List<NicknameDTO> checkAndUnlockNicknames(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return List.of();
        User user = userOpt.get();

        int loginDays = getLoginDaysCount(userId);
        int mockTests = (int) practiceHistoryRepository.countByUserIdAndTimestampBetween(userId, LocalDateTime.of(2000, 1, 1, 0, 0), LocalDateTime.now());
        List<Attendance> userAttendance = attendanceRepository.findByStudent_UserId(userId);
        int attendanceCount = userAttendance != null ? userAttendance.size() : 0;
        int assignmentsCount = submissionRepository.findByStudent_UserId(userId).size();
        int totalXp = user.getTotalXp() != null ? user.getTotalXp() : 0;
        int coins = user.getCoins() != null ? user.getCoins() : 0;
        int level = user.getCurrentLevel() != null ? user.getCurrentLevel() : 1;

        List<Nickname> all = nicknameRepository.findAll();
        List<UserNickname> existingUnlocked = userNicknameRepository.findByUserId(userId);
        Set<Long> alreadyUnlockedIds = existingUnlocked.stream()
                .map(un -> un.getNickname().getId())
                .collect(Collectors.toSet());

        List<NicknameDTO> newlyUnlocked = new ArrayList<>();

        for (Nickname n : all) {
            if (alreadyUnlockedIds.contains(n.getId())) continue;

            boolean shouldUnlock = false;
            switch (n.getUnlockType()) {
                case "LOGIN_STREAK" -> shouldUnlock = loginDays >= n.getRequirementValue();
                case "MOCK_TEST_COUNT" -> shouldUnlock = mockTests >= n.getRequirementValue();
                case "ATTENDANCE_COUNT" -> shouldUnlock = attendanceCount >= n.getRequirementValue();
                case "ASSIGNMENT_COUNT" -> shouldUnlock = assignmentsCount >= n.getRequirementValue();
                case "XP_REACHED" -> shouldUnlock = totalXp >= n.getRequirementValue();
                case "COIN_EARNED" -> shouldUnlock = coins >= n.getRequirementValue();
                case "MAX_LEVEL" -> shouldUnlock = level >= n.getRequirementValue();
                case "MODEL_STUDENT" -> shouldUnlock = loginDays >= 1 || attendanceCount >= 1;
                case "AI_SCHOLAR" -> shouldUnlock = mockTests >= 1 || totalXp >= 10;
                case "ACADEMIC_ACHIEVER" -> shouldUnlock = assignmentsCount >= 1 || attendanceCount >= 1;
                case "MISSION_MASTER" -> shouldUnlock = loginDays >= 1;
                case "CHALLENGE_CONQUEROR" -> shouldUnlock = mockTests >= 1;
                case "HALL_OF_FAME" -> shouldUnlock = alreadyUnlockedIds.size() >= 3;
            }

            if (shouldUnlock) {
                UserNickname un = new UserNickname();
                un.setUserId(userId);
                un.setNickname(n);
                un.setUnlockedAt(LocalDateTime.now());
                un.setIsEquipped(false);
                userNicknameRepository.save(un);

                NicknameDTO dto = new NicknameDTO();
                dto.setId(n.getId());
                dto.setTitle(n.getTitle());
                dto.setDescription(n.getDescription());
                dto.setIcon(n.getIcon());
                dto.setRarity(n.getRarity().name());
                dto.setUnlocked(true);
                newlyUnlocked.add(dto);
            }
        }

        return newlyUnlocked;
    }

    @Transactional
    public boolean equipNickname(Long userId, Long nicknameId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return false;

        List<UserNickname> userNicknames = userNicknameRepository.findByUserId(userId);

        // Unequip all
        for (UserNickname un : userNicknames) {
            un.setIsEquipped(false);
        }

        if (nicknameId != null) {
            UserNickname target = userNicknames.stream()
                    .filter(un -> un.getNickname().getId().equals(nicknameId))
                    .findFirst()
                    .orElse(null);
            if (target != null) {
                target.setIsEquipped(true);
                user.setEquippedNickname(target.getNickname().getIcon() + " " + target.getNickname().getTitle());
            } else {
                user.setEquippedNickname(null);
            }
        } else {
            user.setEquippedNickname(null);
        }

        userNicknameRepository.saveAll(userNicknames);
        userRepository.save(user);
        return true;
    }

    private int getLoginDaysCount(Long userId) {
        List<XPHistory> history = xpHistoryRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);
        if (history == null) return 0;
        return (int) history.stream()
                .filter(h -> h.getActivity() != null && h.getActivity().startsWith("Daily Login"))
                .map(h -> h.getCreatedAt().toLocalDate())
                .distinct()
                .count();
    }
}
