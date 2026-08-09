package edu.example.edu.Controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import edu.example.edu.DTO.AttendanceDTO;
import edu.example.edu.Service.AttendanceService;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    // --------------------- CREATE ---------------------
    @PostMapping("/create")
    @PreAuthorize("hasAnyAuthority('TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public AttendanceDTO create(@RequestBody AttendanceDTO dto) {
        return attendanceService.createAttendance(dto);
    }

    // --------------------- GET BY STUDENT ---------------------
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public List<AttendanceDTO> getByStudent(@PathVariable Long studentId) {
        return attendanceService.getAttendanceByStudent(studentId);
    }

    // --------------------- GET BY CLASS+SUBJECT+DATE+PERIOD ---------------------
    @GetMapping("/class/{classId}/subject/{subjectId}/date/{date}/period/{periodNumber}")
    @PreAuthorize("hasAnyAuthority('TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public List<AttendanceDTO> getAttendanceByClassDatePeriod(
            @PathVariable Long classId,
            @PathVariable Long subjectId,
            @PathVariable String date,
            @PathVariable int periodNumber) {

        LocalDate localDate = LocalDate.parse(date);
        return attendanceService.getAttendanceByClassDatePeriod(classId, subjectId, localDate, periodNumber);
    }

    // --------------------- UPDATE ---------------------
    @PutMapping("/update/{attendanceId}")
    @PreAuthorize("hasAnyAuthority('TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public AttendanceDTO updateAttendance(
            @PathVariable Long attendanceId,
            @RequestBody AttendanceDTO dto) {

        return attendanceService.updateAttendance(attendanceId, dto);
    }

    // --------------------- DELETE ---------------------
    @DeleteMapping("/delete/{attendanceId}")
    @PreAuthorize("hasAnyAuthority('TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public String deleteAttendance(@PathVariable Long attendanceId) {
        attendanceService.deleteAttendance(attendanceId);
        return "Attendance deleted successfully";
    }
}
