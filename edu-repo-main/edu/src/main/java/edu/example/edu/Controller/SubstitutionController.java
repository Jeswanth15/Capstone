package edu.example.edu.Controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.example.edu.DTO.SubstitutionDTO;
import edu.example.edu.Service.SubstitutionService;

@RestController
@RequestMapping("/api/substitutions")
public class SubstitutionController {

    private final SubstitutionService substitutionService;

    public SubstitutionController(SubstitutionService substitutionService) {
        this.substitutionService = substitutionService;
    }

    // Create or Update
    @PostMapping
    @PreAuthorize("hasAnyAuthority('SCHOOLADMIN','PRINCIPAL')")
    public SubstitutionDTO createOrUpdateSubstitution(@RequestBody SubstitutionDTO dto) {
        return substitutionService.saveSubstitution(dto);
    }

    // Get All
    @GetMapping
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public List<SubstitutionDTO> getAllSubstitutions() {
        return substitutionService.getAllSubstitutions();
    }

    // Get by Date
    @GetMapping("/date/{date}")
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public List<SubstitutionDTO> getByDate(@PathVariable String date) {
        LocalDate parsedDate = LocalDate.parse(date);
        return substitutionService.getSubstitutionsByDate(parsedDate);
    }

    // Get by Substitute Teacher
    @GetMapping("/teacher/{teacherId}")
    @PreAuthorize("hasAnyAuthority('TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public List<SubstitutionDTO> getBySubstituteTeacher(@PathVariable Long teacherId) {
        return substitutionService.getBySubstituteTeacher(teacherId);
    }

    // 🔍 Find Free Teachers
    @GetMapping("/free-teachers")
    @PreAuthorize("hasAnyAuthority('SCHOOLADMIN','PRINCIPAL')")
    public List<edu.example.edu.Entity.User> getFreeTeachers(
            @RequestParam String date,
            @RequestParam int periodNumber) {
        java.time.LocalDate parsedDate = java.time.LocalDate.parse(date);
        return substitutionService.findFreeTeachers(parsedDate, periodNumber);
    }

    // Delete
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SCHOOLADMIN','PRINCIPAL','ADMIN')")
    public String deleteSubstitution(@PathVariable Long id) {
        substitutionService.deleteSubstitution(id);
        return "Substitution deleted successfully";
    }
}
