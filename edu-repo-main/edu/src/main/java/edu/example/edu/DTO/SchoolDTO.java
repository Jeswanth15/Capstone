package edu.example.edu.DTO;

import lombok.Data;
import java.util.List;

@Data
public class SchoolDTO {
    private Long schoolId;
    private String name;
    private String address;
    private String contactInfo;
}
