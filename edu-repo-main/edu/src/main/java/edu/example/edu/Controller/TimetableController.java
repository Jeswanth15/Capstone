package edu.example.edu.Controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.example.edu.DTO.TimetableDTO;
import edu.example.edu.Entity.User;
import edu.example.edu.Service.TimetableService;

@RestController
@RequestMapping("/api/timetables")
public class TimetableController {

    private final TimetableService timetableService;

    public TimetableController(TimetableService timetableService) {
        this.timetableService = timetableService;
    }

    // Create
    @PostMapping
    @PreAuthorize("hasAnyAuthority('SCHOOLADMIN','PRINCIPAL')")
    public TimetableDTO create(@RequestBody TimetableDTO dto) {
        return timetableService.createTimetable(dto);
    }

    // Get all
    @GetMapping
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public List<TimetableDTO> getAll() {
        return timetableService.getAllTimetables();
    }

    // Get by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public TimetableDTO getById(@PathVariable Long id) {
        return timetableService.getTimetableById(id);
    }

    // Update
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SCHOOLADMIN','PRINCIPAL')")
    public TimetableDTO update(@PathVariable Long id, @RequestBody TimetableDTO dto) {
        return timetableService.updateTimetable(id, dto);
    }

    // Delete
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SCHOOLADMIN','PRINCIPAL','ADMIN')")
    public void delete(@PathVariable Long id) {
        timetableService.deleteTimetable(id);
    }

    // Get teachers for a class/subject
    @GetMapping("/teachers")
    @PreAuthorize("hasAnyAuthority('SCHOOLADMIN','PRINCIPAL')")
    public List<User> getTeachersForClassSubject(
            @RequestParam Long classId,
            @RequestParam Long subjectId) {
        return timetableService.getTeachersForClassSubject(classId, subjectId);
    }

    // FINAL: Get timetable for a class (DTO)
    @GetMapping("/class/{classId}")
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public List<TimetableDTO> getByClass(@PathVariable Long classId) {
        return timetableService.getTimetableDTOsByClass(classId);
    }
}
