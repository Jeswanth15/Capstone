package edu.example.edu.Controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.example.edu.DTO.EnrollmentDTO;
import edu.example.edu.Service.EnrollmentService;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    // Enroll student
    @PostMapping("/enroll")
    @PreAuthorize("hasAnyAuthority('SCHOOLADMIN','PRINCIPAL')")
    public EnrollmentDTO enrollStudent(@RequestBody EnrollmentDTO dto) {
        return enrollmentService.enrollStudent(dto);
    }

    // Get all enrollments
    @GetMapping
    @PreAuthorize("hasAnyAuthority('TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public List<EnrollmentDTO> getAllEnrollments() {
        return enrollmentService.getAllEnrollments();
    }

    // Get enrollment by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public EnrollmentDTO getEnrollmentById(@PathVariable Long id) {
        return enrollmentService.getEnrollmentById(id);
    }

    // Delete enrollment
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SCHOOLADMIN','PRINCIPAL','ADMIN')")
    public String deleteEnrollment(@PathVariable Long id) {
        enrollmentService.deleteEnrollment(id);
        return "Enrollment deleted successfully";
    }
}
