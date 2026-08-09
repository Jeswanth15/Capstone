package edu.example.edu.Controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import edu.example.edu.DTO.SchoolCalendarDTO;
import edu.example.edu.Service.SchoolCalendarService;

@RestController
@RequestMapping("/api/school-calendar")
public class SchoolCalendarController {

    private final SchoolCalendarService calendarService;

    public SchoolCalendarController(SchoolCalendarService calendarService) {
        this.calendarService = calendarService;
    }

    // Create single calendar entry
    @PostMapping("/create")
    @PreAuthorize("hasAnyAuthority('SCHOOLADMIN','PRINCIPAL')")
    public SchoolCalendarDTO create(@RequestBody SchoolCalendarDTO dto) {
        return calendarService.createCalendarEntry(dto);
    }

    // Get calendar by school
    @GetMapping("/school/{schoolId}")
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public List<SchoolCalendarDTO> getBySchool(@PathVariable Long schoolId) {
        return calendarService.getCalendarBySchool(schoolId);
    }

    // Auto-generate calendar
    @PostMapping("/generate")
    @PreAuthorize("hasAnyAuthority('SCHOOLADMIN','PRINCIPAL')")
    public List<SchoolCalendarDTO> generateCalendar(
            @RequestParam Long schoolId,
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestBody(required = false) List<String> holidays
    ) {
        List<LocalDate> holidayDates = null;
        if (holidays != null) {
            holidayDates = holidays.stream().map(LocalDate::parse).toList();
        }
        calendarService.generateSchoolCalendar(
                schoolId,
                LocalDate.parse(startDate),
                LocalDate.parse(endDate),
                holidayDates
        );

        // Return the updated calendar so frontend can refresh
        return calendarService.getCalendarBySchool(schoolId);
    }

    // Update calendar entry
    @PutMapping("/{calendarId}")
    @PreAuthorize("hasAnyAuthority('SCHOOLADMIN','PRINCIPAL')")
    public SchoolCalendarDTO updateCalendarEntry(
            @PathVariable Long calendarId,
            @RequestBody SchoolCalendarDTO dto) {
        return calendarService.updateCalendarEntry(calendarId, dto);
    }
}
