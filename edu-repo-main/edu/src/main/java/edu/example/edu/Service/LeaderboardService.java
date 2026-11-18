package edu.example.edu.Service;

import edu.example.edu.DTO.BadgeDTO;
import edu.example.edu.DTO.LeaderboardEntryDTO;
import edu.example.edu.Entity.ChallengeTeam;
import edu.example.edu.Entity.TeamChallengeResult;
import edu.example.edu.Entity.User;
import edu.example.edu.Entity.UserBadge;
import edu.example.edu.Repository.ChallengeTeamRepository;
import edu.example.edu.Repository.TeamChallengeResultRepository;
import edu.example.edu.Repository.UserBadgeRepository;
import edu.example.edu.Repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class LeaderboardService {

    private final UserRepository userRepository;
    private final TeamChallengeResultRepository resultRepository;
    private final ChallengeTeamRepository teamRepository;
    private final UserBadgeRepository badgeRepository;
    private final GamificationService gamificationService;

    public LeaderboardService(
            UserRepository userRepository,
            TeamChallengeResultRepository resultRepository,
            ChallengeTeamRepository teamRepository,
            UserBadgeRepository badgeRepository,
            GamificationService gamificationService
    ) {
        this.userRepository = userRepository;
        this.resultRepository = resultRepository;
        this.teamRepository = teamRepository;
        this.badgeRepository = badgeRepository;
        this.gamificationService = gamificationService;
    }

    public List<LeaderboardEntryDTO> getOverallLeaderboard() {
        List<User> students = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.STUDENT)
                .sorted((a, b) -> {
                    int xpA = a.getTotalXp() != null ? a.getTotalXp() : 0;
                    int xpB = b.getTotalXp() != null ? b.getTotalXp() : 0;
                    int cmp = Integer.compare(xpB, xpA);
                    if (cmp != 0) return cmp;
                    int lvlA = a.getCurrentLevel() != null ? a.getCurrentLevel() : 1;
                    int lvlB = b.getCurrentLevel() != null ? b.getCurrentLevel() : 1;
                    int lvlCmp = Integer.compare(lvlB, lvlA);
                    if (lvlCmp != 0) return lvlCmp;
                    return Long.compare(a.getUserId(), b.getUserId());
                })
                .collect(Collectors.toList());

        List<LeaderboardEntryDTO> entries = new ArrayList<>();
        int rank = 1;
        for (User u : students) {
            List<UserBadge> badges = badgeRepository.findByUser_UserId(u.getUserId());
            List<BadgeDTO> badgeDTOs = badges.stream().map(gamificationService::toBadgeDTO).collect(Collectors.toList());
            String clsName = u.getClassroom() != null ? u.getClassroom().getName() : "Student";

            entries.add(new LeaderboardEntryDTO(
                    rank++,
                    u.getUserId(),
                    u.getName() != null ? u.getName() : u.getEmail(),
                    u.getTotalXp() != null ? u.getTotalXp() : 0,
                    u.getTotalXp() != null ? u.getTotalXp() : 0,
                    u.getCurrentLevel() != null ? u.getCurrentLevel() : 1,
                    badgeDTOs,
                    clsName
            ));
        }
        return entries;
    }

    public List<LeaderboardEntryDTO> getTeamLeaderboard() {
        List<TeamChallengeResult> allResults = resultRepository.findAll();
        Map<Long, String> teamNames = new HashMap<>();
        Map<Long, Integer> teamScores = new HashMap<>();

        for (TeamChallengeResult r : allResults) {
            Long tid = r.getTeam().getId();
            teamNames.put(tid, r.getTeam().getName() != null ? r.getTeam().getName() : "Team #" + tid);
            teamScores.put(tid, teamScores.getOrDefault(tid, 0) + (r.getScore() != null ? r.getScore() : 0));
        }

        // Add any created teams that haven't played yet
        List<ChallengeTeam> allTeams = teamRepository.findAll();
        for (ChallengeTeam t : allTeams) {
            if (!teamNames.containsKey(t.getId())) {
                teamNames.put(t.getId(), t.getName());
                teamScores.put(t.getId(), 0);
            }
        }

        List<LeaderboardEntryDTO> entries = new ArrayList<>();
        for (Map.Entry<Long, Integer> entry : teamScores.entrySet()) {
            Long tid = entry.getKey();
            entries.add(new LeaderboardEntryDTO(
                    0,
                    tid,
                    teamNames.get(tid),
                    entry.getValue(),
                    entry.getValue(), // Team accumulated XP/Points
                    1,
                    Collections.emptyList(),
                    "Team Territory Competitor"
            ));
        }

        entries.sort((a, b) -> {
            int cmp = Integer.compare(b.getScore(), a.getScore());
            if (cmp != 0) return cmp;
            return Long.compare(a.getId(), b.getId());
        });

        for (int i = 0; i < entries.size(); i++) {
            entries.get(i).setRank(i + 1);
        }

        return entries;
    }
}
