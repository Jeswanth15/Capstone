package edu.example.edu.Controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import edu.example.edu.DTO.SubjectDTO;
import edu.example.edu.Service.SubjectService;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    // Create subject
    @PostMapping
    @PreAuthorize("hasAnyAuthority('SCHOOLADMIN','PRINCIPAL')")
    public SubjectDTO createSubject(@RequestBody SubjectDTO dto) {
        return subjectService.createSubject(dto);
    }

    // Get all subjects
    @GetMapping
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public List<SubjectDTO> getAllSubjects() {
        return subjectService.getAllSubjects();
    }

    // Get subject by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public SubjectDTO getSubjectById(@PathVariable Long id) {
        return subjectService.getSubjectById(id);
    }

    // Update subject
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SCHOOLADMIN','PRINCIPAL')")
    public SubjectDTO updateSubject(@PathVariable Long id, @RequestBody SubjectDTO dto) {
        return subjectService.updateSubject(id, dto);
    }

    // Delete subject
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SCHOOLADMIN','PRINCIPAL','ADMIN')")
    public void deleteSubject(@PathVariable Long id) {
        subjectService.deleteSubject(id);
    }
}
