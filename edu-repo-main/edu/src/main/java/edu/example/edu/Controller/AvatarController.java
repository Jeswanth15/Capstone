package edu.example.edu.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.example.edu.DTO.AvatarItemDTO;
import edu.example.edu.DTO.BuyItemRequest;
import edu.example.edu.DTO.EquipItemRequest;
import edu.example.edu.DTO.UserAvatarConfigDTO;
import edu.example.edu.Service.AvatarService;

@RestController
@RequestMapping("/api/avatar")
public class AvatarController {

    @Autowired
    private AvatarService avatarService;

    // GET /api/avatar/{userId} or /api/avatar/current/{userId}
    @GetMapping({"/{userId}", "/current/{userId}"})
    public ResponseEntity<UserAvatarConfigDTO> getCurrentAvatar(@PathVariable Long userId) {
        return ResponseEntity.ok(avatarService.getCurrentAvatar(userId));
    }

    // GET /api/avatar/items/{userId}
    @GetMapping("/items/{userId}")
    public ResponseEntity<Map<String, List<AvatarItemDTO>>> getItemsGrouped(@PathVariable Long userId) {
        return ResponseEntity.ok(avatarService.getAllItemsGrouped(userId));
    }

    // POST /api/avatar/save/{userId}
    @PostMapping("/save/{userId}")
    public ResponseEntity<UserAvatarConfigDTO> saveAvatar(
            @PathVariable Long userId,
            @RequestBody UserAvatarConfigDTO configDTO) {
        return ResponseEntity.ok(avatarService.saveAvatarConfig(userId, configDTO));
    }

    // POST /api/avatar/buy/{userId}
    @PostMapping("/buy/{userId}")
    public ResponseEntity<String> buyItem(
            @PathVariable Long userId,
            @RequestBody BuyItemRequest request) {
        String result = avatarService.buyItem(userId, request.getItemId());
        if (result.contains("Not enough") || result.contains("cannot be purchased")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    // POST /api/avatar/equip/{userId}
    @PostMapping("/equip/{userId}")
    public ResponseEntity<String> equipItem(
            @PathVariable Long userId,
            @RequestBody EquipItemRequest request) {
        String result = avatarService.equipItem(userId, request.getCategory(), request.getItemKey());
        if (result.contains("locked")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }
}
