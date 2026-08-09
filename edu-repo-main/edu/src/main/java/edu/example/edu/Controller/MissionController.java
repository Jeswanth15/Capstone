package edu.example.edu.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.example.edu.DTO.MissionDTO;
import edu.example.edu.Service.MissionService;

@RestController
@RequestMapping("/api/missions")
public class MissionController {

    @Autowired
    private MissionService missionService;

    @GetMapping("/daily/{userId}")
    public ResponseEntity<List<MissionDTO>> getDailyMissions(@PathVariable Long userId) {
        return ResponseEntity.ok(missionService.getDailyMissions(userId));
    }

    @GetMapping("/weekly/{userId}")
    public ResponseEntity<List<MissionDTO>> getWeeklyChallenges(@PathVariable Long userId) {
        return ResponseEntity.ok(missionService.getWeeklyChallenges(userId));
    }

    @PostMapping("/claim-daily-bonus/{userId}")
    public ResponseEntity<String> claimDailyBonus(@PathVariable Long userId) {
        boolean success = missionService.claimDailyBonus(userId);
        if (success) {
            return ResponseEntity.ok("Daily Champion bonus awarded! +100 XP, +50 Coins");
        }
        return ResponseEntity.badRequest().body("Not all daily missions completed, or bonus already claimed today.");
    }

    @PostMapping("/claim-weekly-bonus/{userId}")
    public ResponseEntity<String> claimWeeklyBonus(@PathVariable Long userId) {
        boolean success = missionService.claimWeeklyBonus(userId);
        if (success) {
            return ResponseEntity.ok("Weekly Warrior bonus awarded! +500 XP, +250 Coins");
        }
        return ResponseEntity.badRequest()
                .body("Not all weekly challenges completed, or bonus already claimed this week.");
    }
}
