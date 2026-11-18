package edu.example.edu.Controller;

import edu.example.edu.DTO.LeaderboardEntryDTO;
import edu.example.edu.Service.LeaderboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping("/overall")
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public ResponseEntity<List<LeaderboardEntryDTO>> getOverallLeaderboard() {
        return ResponseEntity.ok(leaderboardService.getOverallLeaderboard());
    }

    @GetMapping("/team")
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public ResponseEntity<List<LeaderboardEntryDTO>> getTeamLeaderboard() {
        return ResponseEntity.ok(leaderboardService.getTeamLeaderboard());
    }
}
