package edu.example.edu.Controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.example.edu.DTO.EquipNicknameRequest;
import edu.example.edu.DTO.NicknameDTO;
import edu.example.edu.Service.NicknameService;

@RestController
@RequestMapping("/api/nicknames")
public class NicknameController {

    @Autowired
    private NicknameService nicknameService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NicknameDTO>> getNicknamesForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(nicknameService.getNicknamesForUser(userId));
    }

    @PostMapping("/check/{userId}")
    public ResponseEntity<List<NicknameDTO>> checkAndUnlockNicknames(@PathVariable Long userId) {
        return ResponseEntity.ok(nicknameService.checkAndUnlockNicknames(userId));
    }

    @PostMapping("/equip")
    public ResponseEntity<String> equipNickname(@RequestBody EquipNicknameRequest req) {
        boolean success = nicknameService.equipNickname(req.getUserId(), req.getNicknameId());
        if (success) {
            return ResponseEntity.ok("Nickname updated successfully");
        }
        return ResponseEntity.badRequest().body("Failed to update nickname");
    }
}
