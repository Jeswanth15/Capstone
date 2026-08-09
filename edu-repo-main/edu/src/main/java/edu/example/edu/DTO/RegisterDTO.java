package edu.example.edu.DTO;

import lombok.Data;

@Data
public class RegisterDTO {
    private String name;
    private String email;
    private String password;
    private String role;    // STUDENT, TEACHER, etc.
    private Long schoolId;
}
