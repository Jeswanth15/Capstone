package edu.example.edu.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.example.edu.DTO.MissionDTO;
import edu.example.edu.Entity.Assignment;
import edu.example.edu.Entity.Attendance;
import edu.example.edu.Entity.Timetable;
import edu.example.edu.Entity.User;
import edu.example.edu.Entity.XPHistory;
import edu.example.edu.Repository.AssignmentRepository;
import edu.example.edu.Repository.AttendanceRepository;
import edu.example.edu.Repository.PracticeHistoryRepository;
import edu.example.edu.Repository.SubmissionRepository;
import edu.example.edu.Repository.TimetableRepository;
import edu.example.edu.Repository.UserRepository;
import edu.example.edu.Repository.XPHistoryRepository;

@Service
public class MissionService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private XPHistoryRepository xpHistoryRepository;

    @Autowired
    private PracticeHistoryRepository practiceHistoryRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private TimetableRepository timetableRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private GamificationService gamificationService;

    // ========== DAILY MISSIONS ==========

    public List<MissionDTO> getDailyMissions(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return List.of();
        User user = userOpt.get();

        LocalDate today = LocalDate.now();
        List<MissionDTO> missions = new ArrayList<>();

        // 1. Daily Login
        try {
            missions.add(buildDailyLoginMission(userId, today));
        } catch (Exception e) {
            e.printStackTrace();
        }

        // 2. Complete Mock Test / Daily Challenge
        try {
            missions.add(buildDailyMockTestMission(userId, today));
        } catch (Exception e) {
            e.printStackTrace();
        }

        // 3. Attend All Today's Classes (only if classes today)
        try {
            MissionDTO attendanceMission = buildDailyAttendanceMission(userId, user, today);
            if (attendanceMission != null) {
                missions.add(attendanceMission);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return missions;
    }

    private MissionDTO buildDailyLoginMission(Long userId, LocalDate today) {
        String activityKey = "Daily Login - " + today;
        boolean done = xpHistoryRepository.existsByUser_UserIdAndActivity(userId, activityKey);
        return new MissionDTO(
                "DAILY_LOGIN", "Daily Login", "Login to the platform today.",
                "🔐", done ? 1 : 0, 1, done, 20, 10, "DAILY"
        );
    }

    private MissionDTO buildDailyMockTestMission(Long userId, LocalDate today) {
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.plusDays(1).atStartOfDay();
        long count = practiceHistoryRepository.countByUserIdAndTimestampBetween(userId, startOfDay, endOfDay);
        boolean done = count >= 1;
        return new MissionDTO(
                "DAILY_MOCK_TEST", "Complete Today's Mock Test",
                "Complete one mock test or daily challenge today.",
                "🧠", done ? 1 : (int) Math.min(count, 1), 1, done, 100, 30, "DAILY"
        );
    }

    private MissionDTO buildDailyAttendanceMission(Long userId, User user, LocalDate today) {
        if (user == null || user.getClassroom() == null) return null;
        Long classId = user.getClassroom().getClassId();
        if (classId == null) return null;

        // Map Java DayOfWeek to Timetable.DayOfWeek
        Timetable.DayOfWeek ttDay = mapToTimetableDayOfWeek(today.getDayOfWeek());
        if (ttDay == null) return null; // Sunday

        List<Timetable> todaySlots = timetableRepository.findByClassroom_ClassIdAndDayOfWeek(classId, ttDay);
        if (todaySlots == null || todaySlots.isEmpty()) return null; // No classes today

        int target = todaySlots.size();
        long attended = attendanceRepository.countByStudent_UserIdAndDateAndStatus(
                userId, today, Attendance.Status.PRESENT
        );
        long absent = attendanceRepository.countByStudent_UserIdAndDateAndStatus(
                userId, today, Attendance.Status.ABSENT
        );

        int progress = (int) Math.min(attended, target);
        boolean done = progress >= target;

        MissionDTO dto = new MissionDTO(
                "DAILY_ATTENDANCE", "Attend All Today's Classes",
                "Attend every scheduled class for today.",
                "📚", progress, target, done, 80, 20, "DAILY"
        );
        dto.setTotalPeriods(target);
        dto.setAttendedPeriods((int) attended);
        dto.setAbsentPeriods((int) absent);
        dto.setRemainingPeriods(Math.max(0, target - (int) attended - (int) absent));
        return dto;
    }

    // ========== WEEKLY CHALLENGES ==========

    public List<MissionDTO> getWeeklyChallenges(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return List.of();
        User user = userOpt.get();

        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        List<MissionDTO> challenges = new ArrayList<>();

        // 1. Login for 7 Days
        try {
            challenges.add(buildWeeklyLoginChallenge(userId, weekStart, weekEnd));
        } catch (Exception e) {
            e.printStackTrace();
        }

        // 2. Attend Every Scheduled Class This Week
        try {
            challenges.add(buildWeeklyAttendanceChallenge(userId, user, weekStart, weekEnd));
        } catch (Exception e) {
            e.printStackTrace();
        }

        // 3. Complete 5 Mock Tests
        try {
            challenges.add(buildWeeklyMockTestChallenge(userId, weekStart, weekEnd));
        } catch (Exception e) {
            e.printStackTrace();
        }

        // 4. Complete All Assignments Due This Week
        try {
            MissionDTO assignmentChallenge = buildWeeklyAssignmentChallenge(userId, user, weekStart, weekEnd);
            if (assignmentChallenge != null) {
                challenges.add(assignmentChallenge);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return challenges;
    }

    private MissionDTO buildWeeklyLoginChallenge(Long userId, LocalDate weekStart, LocalDate weekEnd) {
        List<XPHistory> allXpHistory = xpHistoryRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);
        long loginDays = 0;
        if (allXpHistory != null) {
            loginDays = allXpHistory.stream()
                    .filter(h -> h.getActivity() != null && h.getActivity().startsWith("Daily Login"))
                    .filter(h -> {
                        if (h.getCreatedAt() == null) return false;
                        LocalDate d = h.getCreatedAt().toLocalDate();
                        return !d.isBefore(weekStart) && !d.isAfter(weekEnd);
                    })
                    .map(h -> h.getCreatedAt().toLocalDate())
                    .distinct()
                    .count();
        }

        int progress = (int) Math.min(loginDays, 7);
        return new MissionDTO(
                "WEEKLY_LOGIN", "Login for 7 Days",
                "Login to the platform every day this week.",
                "🔥", progress, 7, progress >= 7, 300, 100, "WEEKLY"
        );
    }

    private MissionDTO buildWeeklyAttendanceChallenge(Long userId, User user, LocalDate weekStart, LocalDate weekEnd) {
        if (user == null || user.getClassroom() == null || user.getClassroom().getClassId() == null) {
            MissionDTO dto = new MissionDTO(
                    "WEEKLY_ATTENDANCE", "Attend Every Scheduled Class This Week",
                    "Attend all scheduled classes this week.",
                    "📅", 0, 1, false, 500, 200, "WEEKLY"
            );
            dto.setTotalPeriods(0);
            dto.setAttendedPeriods(0);
            dto.setAbsentPeriods(0);
            dto.setRemainingPeriods(0);
            return dto;
        }
        Long classId = user.getClassroom().getClassId();

        int totalScheduled = 0;
        LocalDate d = weekStart;
        LocalDate countUntil = LocalDate.now().isAfter(weekEnd) ? weekEnd : LocalDate.now();
        while (!d.isAfter(countUntil)) {
            Timetable.DayOfWeek ttDay = mapToTimetableDayOfWeek(d.getDayOfWeek());
            if (ttDay != null) {
                List<Timetable> slots = timetableRepository.findByClassroom_ClassIdAndDayOfWeek(classId, ttDay);
                if (slots != null) {
                    totalScheduled += slots.size();
                }
            }
            d = d.plusDays(1);
        }

        List<Attendance> attendedList = attendanceRepository.findByStudent_UserIdAndDateBetweenAndStatus(
                userId, weekStart, weekEnd, Attendance.Status.PRESENT
        );
        List<Attendance> absentList = attendanceRepository.findByStudent_UserIdAndDateBetweenAndStatus(
                userId, weekStart, weekEnd, Attendance.Status.ABSENT
        );
        int attended = attendedList != null ? attendedList.size() : 0;
        int absent = absentList != null ? absentList.size() : 0;
        int target = Math.max(totalScheduled, 1);
        int progress = Math.min(attended, target);

        MissionDTO dto = new MissionDTO(
                "WEEKLY_ATTENDANCE", "Attend Every Scheduled Class This Week",
                "Attend all scheduled classes this week.",
                "📅", progress, target, progress >= target, 500, 200, "WEEKLY"
        );
        dto.setTotalPeriods(target);
        dto.setAttendedPeriods(attended);
        dto.setAbsentPeriods(absent);
        dto.setRemainingPeriods(Math.max(0, target - attended - absent));
        return dto;
    }

    private MissionDTO buildWeeklyMockTestChallenge(Long userId, LocalDate weekStart, LocalDate weekEnd) {
        LocalDateTime start = weekStart.atStartOfDay();
        LocalDateTime end = weekEnd.plusDays(1).atStartOfDay();
        long count = practiceHistoryRepository.countByUserIdAndTimestampBetween(userId, start, end);
        int progress = (int) Math.min(count, 5);

        return new MissionDTO(
                "WEEKLY_MOCK_TESTS", "Complete 5 Mock Tests",
                "Complete at least 5 Practice Tests or Challenges this week.",
                "🧠", progress, 5, progress >= 5, 500, 250, "WEEKLY"
        );
    }

    private MissionDTO buildWeeklyAssignmentChallenge(Long userId, User user, LocalDate weekStart, LocalDate weekEnd) {
        if (user == null || user.getClassroom() == null || user.getClassroom().getClassId() == null) return null;
        Long classId = user.getClassroom().getClassId();

        List<Assignment> weekAssignments = assignmentRepository.findByClassroom_ClassIdAndDueDateBetween(
                classId, weekStart, weekEnd
        );
        if (weekAssignments == null || weekAssignments.isEmpty()) return null;

        int target = weekAssignments.size();

        Set<Long> submittedAssignmentIds = submissionRepository.findByStudent_UserId(userId)
                .stream()
                .filter(s -> s.getAssignment() != null)
                .map(s -> s.getAssignment().getAssignmentId())
                .collect(Collectors.toSet());

        int submitted = 0;
        for (Assignment a : weekAssignments) {
            if (a != null && submittedAssignmentIds.contains(a.getAssignmentId())) {
                submitted++;
            }
        }

        return new MissionDTO(
                "WEEKLY_ASSIGNMENTS", "Complete All Assignments",
                "Submit every assignment due this week.",
                "📝", submitted, target, submitted >= target, 500, 300, "WEEKLY"
        );
    }

    // ========== BONUS CLAIMS ==========

    public boolean claimDailyBonus(Long userId) {
        List<MissionDTO> daily = getDailyMissions(userId);
        boolean allDone = !daily.isEmpty() && daily.stream().allMatch(MissionDTO::isCompleted);
        if (!allDone) return false;

        String bonusKey = "Daily Champion - " + LocalDate.now();
        return gamificationService.awardXP(userId, bonusKey);
    }

    public boolean claimWeeklyBonus(Long userId) {
        List<MissionDTO> weekly = getWeeklyChallenges(userId);
        boolean allDone = !weekly.isEmpty() && weekly.stream().allMatch(MissionDTO::isCompleted);
        if (!allDone) return false;

        LocalDate weekStart = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        String bonusKey = "Weekly Warrior - " + weekStart;
        return gamificationService.awardXP(userId, bonusKey);
    }

    // ========== HELPERS ==========

    private Timetable.DayOfWeek mapToTimetableDayOfWeek(DayOfWeek javaDay) {
        return switch (javaDay) {
            case MONDAY -> Timetable.DayOfWeek.MON;
            case TUESDAY -> Timetable.DayOfWeek.TUE;
            case WEDNESDAY -> Timetable.DayOfWeek.WED;
            case THURSDAY -> Timetable.DayOfWeek.THU;
            case FRIDAY -> Timetable.DayOfWeek.FRI;
            case SATURDAY -> Timetable.DayOfWeek.SAT;
            case SUNDAY -> null;
        };
    }
}
