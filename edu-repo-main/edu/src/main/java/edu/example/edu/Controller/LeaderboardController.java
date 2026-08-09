package edu.example.edu.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.example.edu.DTO.LeaderboardDTO;
import edu.example.edu.DTO.StudentProfilePreviewDTO;
import edu.example.edu.Service.LeaderboardService;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    @Autowired
    private LeaderboardService leaderboardService;

    @GetMapping("/school")
    public ResponseEntity<List<LeaderboardDTO>> getSchoolLeaderboard(
            @RequestParam(defaultValue = "all") String filter,
            @RequestParam(required = false) Long currentUserId) {
        return ResponseEntity.ok(leaderboardService.getSchoolLeaderboard(filter, currentUserId));
    }

    @GetMapping("/class")
    public ResponseEntity<List<LeaderboardDTO>> getClassLeaderboard(
            @RequestParam(defaultValue = "all") String filter,
            @RequestParam(required = false) Long currentUserId) {
        return ResponseEntity.ok(leaderboardService.getClassLeaderboard(filter, currentUserId));
    }

    @GetMapping("/profile/{targetUserId}")
    public ResponseEntity<StudentProfilePreviewDTO> getProfilePreview(@PathVariable Long targetUserId) {
        StudentProfilePreviewDTO preview = leaderboardService.getStudentProfilePreview(targetUserId);
        if (preview != null) {
            return ResponseEntity.ok(preview);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/trigger-weekly-rewards")
    public ResponseEntity<String> triggerWeeklyRewards() {
        leaderboardService.processWeeklyRewards();
        return ResponseEntity.ok("Weekly leaderboard rewards processed successfully!");
    }
}
