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

import edu.example.edu.DTO.ExamScheduleDTO;
import edu.example.edu.Service.ExamScheduleService;

@RestController
@RequestMapping("/api/exam-schedules")
public class ExamScheduleController {

    private final ExamScheduleService examScheduleService;

    public ExamScheduleController(ExamScheduleService examScheduleService) {
        this.examScheduleService = examScheduleService;
    }

    // Add or Update Exam Schedule
    @PostMapping
    @PreAuthorize("hasAnyAuthority('SCHOOLADMIN','PRINCIPAL')")
    public ExamScheduleDTO createOrUpdateExamSchedule(@RequestBody ExamScheduleDTO dto) {
        return examScheduleService.saveExamSchedule(dto);
    }

    // Get All
    @GetMapping
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public List<ExamScheduleDTO> getAllExamSchedules() {
        return examScheduleService.getAllExamSchedules();
    }

    // Get by Classroom
    @GetMapping("/classroom/{classroomId}")
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public List<ExamScheduleDTO> getExamSchedulesByClassroom(@PathVariable Long classroomId) {
        return examScheduleService.getExamSchedulesByClassroom(classroomId);
    }

    // Delete
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SCHOOLADMIN','PRINCIPAL','ADMIN')")
    public String deleteExamSchedule(@PathVariable Long id) {
        examScheduleService.deleteExamSchedule(id);
        return "Exam Schedule deleted successfully";
    }
}
