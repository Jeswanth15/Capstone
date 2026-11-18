package edu.example.edu.Controller;

import edu.example.edu.DTO.UserGamificationProfileDTO;
import edu.example.edu.Service.GamificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gamification")
public class GamificationController {

    private final GamificationService gamificationService;

    public GamificationController(GamificationService gamificationService) {
        this.gamificationService = gamificationService;
    }

    @GetMapping("/profile/{userId}")
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public ResponseEntity<UserGamificationProfileDTO> getUserGamificationProfile(@PathVariable Long userId) {
        UserGamificationProfileDTO profile = gamificationService.getUserProfile(userId);
        return ResponseEntity.ok(profile);
    }
}
