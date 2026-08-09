package edu.example.edu.DTO;

import lombok.Data;

@Data
public class UserDTO {
    private Long userId;
    private String name;
    private String email;
    private String role;
    private String approvalStatus; // 👈 added
    private Long schoolId;
    private Long classroomId;
}
