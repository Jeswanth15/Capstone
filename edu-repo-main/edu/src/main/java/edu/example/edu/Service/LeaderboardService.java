package edu.example.edu.Service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import edu.example.edu.DTO.LeaderboardDTO;
import edu.example.edu.DTO.StudentProfilePreviewDTO;
import edu.example.edu.Entity.User;
import edu.example.edu.Entity.UserAvatar;
import edu.example.edu.Entity.XPHistory;
import edu.example.edu.Repository.AttendanceRepository;
import edu.example.edu.Repository.ClassroomRepository;
import edu.example.edu.Repository.PracticeHistoryRepository;
import edu.example.edu.Repository.SchoolRepository;
import edu.example.edu.Repository.UserAvatarRepository;
import edu.example.edu.Repository.UserRepository;
import edu.example.edu.Repository.UserUnlockedItemRepository;
import edu.example.edu.Repository.XPHistoryRepository;

@Service
public class LeaderboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClassroomRepository classroomRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private XPHistoryRepository xpHistoryRepository;

    @Autowired
    private PracticeHistoryRepository practiceHistoryRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private UserUnlockedItemRepository userUnlockedItemRepository;

    @Autowired
    private UserAvatarRepository userAvatarRepository;

    @Autowired
    private GamificationService gamificationService;

    public List<LeaderboardDTO> getSchoolLeaderboard(String filter, Long currentUserId) {
        User currentUser = currentUserId != null ? userRepository.findById(currentUserId).orElse(null) : null;
        Long targetSchoolId = (currentUser != null && currentUser.getSchool() != null) ? currentUser.getSchool().getSchoolId() : null;

        List<User> students = userRepository.findAll().stream()
                .filter(u -> u != null && (u.getRole() == null || u.getRole() == User.Role.STUDENT || "STUDENT".equalsIgnoreCase(u.getRole().name())))
                .filter(u -> targetSchoolId == null || (u.getSchool() != null && targetSchoolId.equals(u.getSchool().getSchoolId())))
                .collect(Collectors.toList());

        if (students.isEmpty()) {
            students = userRepository.findAll().stream()
                    .filter(u -> u != null && (u.getRole() == null || u.getRole() != User.Role.ADMIN))
                    .filter(u -> targetSchoolId == null || (u.getSchool() != null && targetSchoolId.equals(u.getSchool().getSchoolId())))
                    .collect(Collectors.toList());
        }

        return buildRankedLeaderboard(students, filter, currentUserId);
    }

    public List<LeaderboardDTO> getClassLeaderboard(String filter, Long currentUserId) {
        if (currentUserId == null) {
            return getSchoolLeaderboard(filter, currentUserId);
        }

        User currentUser = userRepository.findById(currentUserId).orElse(null);
        if (currentUser == null || currentUser.getClassroom() == null) {
            return getSchoolLeaderboard(filter, currentUserId);
        }

        Long targetClassroomId = currentUser.getClassroom().getClassId();
        List<User> classStudents = userRepository.findAll().stream()
                .filter(u -> u != null && u.getClassroom() != null
                        && targetClassroomId.equals(u.getClassroom().getClassId()))
                .collect(Collectors.toList());

        return buildRankedLeaderboard(classStudents, filter, currentUserId);
    }

    private List<LeaderboardDTO> buildRankedLeaderboard(List<User> students, String filter, Long currentUserId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime filterStart = null;

        if ("month".equalsIgnoreCase(filter)) {
            filterStart = now.with(TemporalAdjusters.firstDayOfMonth()).withHour(0).withMinute(0).withSecond(0);
        } else if ("week".equalsIgnoreCase(filter)) {
            filterStart = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).withHour(0).withMinute(0).withSecond(0);
        }

        final LocalDateTime startTime = filterStart;

        List<StudentRankHolder> holders = new ArrayList<>();
        for (User u : students) {
            if (u == null) continue;

            int timeFilteredXp = 0;
            if (startTime != null) {
                try {
                    List<XPHistory> xpLogs = xpHistoryRepository.findByUser_UserIdOrderByCreatedAtDesc(u.getUserId());
                    if (xpLogs != null) {
                        timeFilteredXp = xpLogs.stream()
                                .filter(x -> x != null && x.getCreatedAt() != null && !x.getCreatedAt().isBefore(startTime))
                                .mapToInt(x -> x.getXpEarned() != null ? x.getXpEarned() : 0)
                                .sum();
                    }
                } catch (Exception e) {
                    timeFilteredXp = u.getTotalXp() != null ? u.getTotalXp() : 0;
                }
            } else {
                timeFilteredXp = u.getTotalXp() != null ? u.getTotalXp() : 0;
            }

            long mockTestsCount = 0;
            try {
                mockTestsCount = practiceHistoryRepository.countByUserId(u.getUserId());
            } catch (Exception e) {
                mockTestsCount = 0;
            }

            LocalDateTime created = u.getCreatedAt() != null ? u.getCreatedAt() : LocalDateTime.now().minusDays(30);

            holders.add(new StudentRankHolder(u, timeFilteredXp, u.getCurrentLevel() != null ? u.getCurrentLevel() : 1, mockTestsCount, created));
        }

        Collections.sort(holders, (a, b) -> {
            if (b.xp != a.xp) return Integer.compare(b.xp, a.xp);
            if (b.level != a.level) return Integer.compare(b.level, a.level);
            if (b.mockTestsCount != a.mockTestsCount) return Long.compare(b.mockTestsCount, a.mockTestsCount);
            LocalDateTime tA = a.createdAt != null ? a.createdAt : LocalDateTime.MAX;
            LocalDateTime tB = b.createdAt != null ? b.createdAt : LocalDateTime.MAX;
            return tA.compareTo(tB);
        });

        List<LeaderboardDTO> dtoList = new ArrayList<>();
        int currentRank = 1;
        for (StudentRankHolder h : holders) {
            User u = h.user;
            String className = u.getClassroom() != null ? u.getClassroom().getName() : "General";
            String badge = getBadgeForLevel(h.level);

            String avatarConfigStr = null;
            try {
                Optional<UserAvatar> avatarOpt = userAvatarRepository.findByUserId(u.getUserId());
                if (avatarOpt.isPresent()) {
                    UserAvatar av = avatarOpt.get();
                    avatarConfigStr = String.format("{\"hair\":\"%s\",\"eyes\":\"%s\",\"eyebrows\":\"%s\",\"mouth\":\"%s\",\"glasses\":\"%s\",\"clothes\":\"%s\",\"frame\":\"%s\",\"background\":\"%s\"}",
                            av.getHair(), av.getEyes(), av.getEyebrows(), av.getMouth(), av.getGlasses(), av.getClothes(), av.getFrame(), av.getBackground());
                }
            } catch (Exception e) {}

            boolean isCurrent = currentUserId != null && u.getUserId() != null && u.getUserId().equals(currentUserId);

            LeaderboardDTO dto = new LeaderboardDTO(
                    currentRank++,
                    u.getUserId(),
                    u.getName() != null ? u.getName() : "Student #" + u.getUserId(),
                    u.getEquippedNickname(),
                    className,
                    h.level,
                    h.xp,
                    u.getCoins() != null ? u.getCoins() : 0,
                    h.mockTestsCount,
                    h.createdAt,
                    badge,
                    avatarConfigStr,
                    isCurrent
            );
            dtoList.add(dto);
        }

        return dtoList;
    }

    public StudentProfilePreviewDTO getStudentProfilePreview(Long targetUserId) {
        if (targetUserId == null) return null;
        User u = userRepository.findById(targetUserId).orElse(null);
        if (u == null) return null;

        String className = u.getClassroom() != null ? u.getClassroom().getName() : "General";

        String avatarConfigStr = null;
        try {
            Optional<UserAvatar> avatarOpt = userAvatarRepository.findByUserId(targetUserId);
            if (avatarOpt.isPresent()) {
                UserAvatar av = avatarOpt.get();
                avatarConfigStr = String.format("{\"hair\":\"%s\",\"eyes\":\"%s\",\"eyebrows\":\"%s\",\"mouth\":\"%s\",\"glasses\":\"%s\",\"clothes\":\"%s\",\"frame\":\"%s\",\"background\":\"%s\"}",
                        av.getHair(), av.getEyes(), av.getEyebrows(), av.getMouth(), av.getGlasses(), av.getClothes(), av.getFrame(), av.getBackground());
            }
        } catch (Exception e) {}

        double attendancePct = 95.0;
        int achievementsCount = 4;
        try {
            achievementsCount = userUnlockedItemRepository.findByUserId(targetUserId).size();
        } catch (Exception e) {}

        return new StudentProfilePreviewDTO(
                u.getUserId(),
                u.getName() != null ? u.getName() : "Student",
                u.getEquippedNickname(),
                className,
                u.getCurrentLevel() != null ? u.getCurrentLevel() : 1,
                u.getTotalXp() != null ? u.getTotalXp() : 0,
                u.getCoins() != null ? u.getCoins() : 0,
                attendancePct,
                achievementsCount,
                getBadgeForLevel(u.getCurrentLevel()),
                avatarConfigStr
        );
    }

    @Scheduled(cron = "0 0 0 * * MON")
    public void processWeeklyRewardsCron() {
        processWeeklyRewards();
    }

    public void processWeeklyRewards() {
        System.out.println("[Leaderboard] Processing Monday Weekly Leaderboard Rewards...");
        try {
            List<LeaderboardDTO> schoolWeekly = getSchoolLeaderboard("week", null);
            if (schoolWeekly.size() >= 1) {
                gamificationService.awardXP(schoolWeekly.get(0).getUserId(), "🏆 School Leaderboard Rank #1 Weekly Reward (+1000 XP)");
                awardCoins(schoolWeekly.get(0).getUserId(), 500);
            }
            if (schoolWeekly.size() >= 2) {
                gamificationService.awardXP(schoolWeekly.get(1).getUserId(), "🥈 School Leaderboard Rank #2 Weekly Reward (+700 XP)");
                awardCoins(schoolWeekly.get(1).getUserId(), 300);
            }
            if (schoolWeekly.size() >= 3) {
                gamificationService.awardXP(schoolWeekly.get(2).getUserId(), "🥉 School Leaderboard Rank #3 Weekly Reward (+500 XP)");
                awardCoins(schoolWeekly.get(2).getUserId(), 200);
            }
        } catch (Exception e) {
            System.err.println("[Leaderboard] Error processing weekly rewards: " + e.getMessage());
        }
    }

    private void awardCoins(Long userId, int coins) {
        if (userId == null) return;
        User u = userRepository.findById(userId).orElse(null);
        if (u != null) {
            u.setCoins((u.getCoins() != null ? u.getCoins() : 0) + coins);
            userRepository.save(u);
        }
    }

    private String getBadgeForLevel(Integer level) {
        if (level == null || level <= 1) return "🌱 Novice";
        if (level == 2) return "📚 Scholar";
        if (level == 3) return "🔭 Explorer";
        if (level == 4) return "🎓 Graduate";
        if (level == 5) return "⚡ Mastermind";
        if (level == 6) return "🏆 Grandmaster";
        return "👑 Legend";
    }

    private static class StudentRankHolder {
        User user;
        int xp;
        int level;
        long mockTestsCount;
        LocalDateTime createdAt;

        StudentRankHolder(User user, int xp, int level, long mockTestsCount, LocalDateTime createdAt) {
            this.user = user;
            this.xp = xp;
            this.level = level;
            this.mockTestsCount = mockTestsCount;
            this.createdAt = createdAt;
        }
    }
}
