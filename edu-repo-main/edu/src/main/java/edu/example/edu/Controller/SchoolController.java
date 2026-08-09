package edu.example.edu.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.example.edu.DTO.SchoolDTO;
import edu.example.edu.Service.SchoolService;

@RestController
@RequestMapping("/api/schools")
public class SchoolController {

    @Autowired
    private SchoolService schoolService;

    // Create school
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public SchoolDTO createSchool(@RequestBody SchoolDTO dto) {
        return schoolService.createSchool(dto);
    }

    // Get all schools
    @GetMapping
    
    public List<SchoolDTO> getAllSchools() {
        return schoolService.getAllSchools();
    }

    // Get school by ID
    @GetMapping("/{id}")
    
    public SchoolDTO getSchoolById(@PathVariable Long id) {
        return schoolService.getSchoolById(id);
    }

    // Update school
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public SchoolDTO updateSchool(@PathVariable Long id, @RequestBody SchoolDTO dto) {
        return schoolService.updateSchool(id, dto);
    }

    // Delete school
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public String deleteSchool(@PathVariable Long id) {
        schoolService.deleteSchool(id);
        return "School deleted successfully";
    }
}
