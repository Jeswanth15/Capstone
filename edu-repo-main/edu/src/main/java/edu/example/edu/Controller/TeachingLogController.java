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

import edu.example.edu.DTO.TeachingLogDTO;
import edu.example.edu.Service.TeachingLogService;

@RestController
@RequestMapping("/api/teachinglogs")
public class TeachingLogController {

    private final TeachingLogService teachingLogService;

    public TeachingLogController(TeachingLogService teachingLogService) {
        this.teachingLogService = teachingLogService;
    }

    // Create or update
    @PostMapping
    @PreAuthorize("hasAnyAuthority('TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public TeachingLogDTO createOrUpdate(@RequestBody TeachingLogDTO dto) {
        return teachingLogService.saveTeachingLog(dto);
    }

    // Get all logs
    @GetMapping
    @PreAuthorize("hasAnyAuthority('TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public List<TeachingLogDTO> getAll() {
        return teachingLogService.getAllLogs();
    }

    // Get by ClassSubject
    @GetMapping("/classSubject/{id}")
    @PreAuthorize("hasAnyAuthority('TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public List<TeachingLogDTO> getByClassSubject(@PathVariable Long id) {
        return teachingLogService.getByClassSubject(id);
    }

    // Get by Teacher
    @GetMapping("/teacher/{id}")
    @PreAuthorize("hasAnyAuthority('TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public List<TeachingLogDTO> getByTeacher(@PathVariable Long id) {
        return teachingLogService.getByTeacher(id);
    }

    // Delete
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SCHOOLADMIN','PRINCIPAL','ADMIN')")
    public String delete(@PathVariable Long id) {
        teachingLogService.deleteTeachingLog(id);
        return "Teaching log deleted successfully";
    }
}
