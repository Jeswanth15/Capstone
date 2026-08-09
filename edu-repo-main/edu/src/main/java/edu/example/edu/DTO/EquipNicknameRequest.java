package edu.example.edu.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipNicknameRequest {
    private Long userId;
    private Long nicknameId;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getNicknameId() { return nicknameId; }
    public void setNicknameId(Long nicknameId) { this.nicknameId = nicknameId; }
}
