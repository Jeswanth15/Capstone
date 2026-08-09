package edu.example.edu.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.example.edu.DTO.GamificationRewardDTO;
import edu.example.edu.DTO.GamificationStatusDTO;
import edu.example.edu.Entity.CoinHistory;
import edu.example.edu.Entity.XPHistory;
import edu.example.edu.Service.GamificationService;

@RestController
@RequestMapping("/api/gamification")
public class GamificationController {

    @Autowired
    private GamificationService gamificationService;

    @GetMapping("/status/{userId}")
    public ResponseEntity<GamificationStatusDTO> getStatus(@PathVariable Long userId) {
        return ResponseEntity.ok(gamificationService.getGamificationStatus(userId));
    }

    @PostMapping("/award/{userId}")
    public ResponseEntity<String> awardReward(@PathVariable Long userId, @RequestBody GamificationRewardDTO dto) {
        boolean success = gamificationService.awardXP(userId, dto.getActivity());
        if (success) {
            return ResponseEntity.ok("Reward awarded successfully");
        }
        return ResponseEntity.badRequest().body("Failed to award reward or already awarded");
    }

    @GetMapping("/xp-history/{userId}")
    public ResponseEntity<List<XPHistory>> getXpHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(gamificationService.getXpHistory(userId));
    }

    @GetMapping("/coin-history/{userId}")
    public ResponseEntity<List<CoinHistory>> getCoinHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(gamificationService.getCoinHistory(userId));
    }

}
