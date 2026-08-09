package edu.example.edu.Service;

import edu.example.edu.DTO.SchoolCalendarDTO;
import edu.example.edu.Entity.School;
import edu.example.edu.Entity.SchoolCalendar;
import edu.example.edu.Repository.SchoolCalendarRepository;
import edu.example.edu.Repository.SchoolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SchoolCalendarService {

    @Autowired
    private SchoolCalendarRepository calendarRepo;

    @Autowired
    private SchoolRepository schoolRepo;

    // Create a single calendar entry
    public SchoolCalendarDTO createCalendarEntry(SchoolCalendarDTO dto) {
        School school = schoolRepo.findById(dto.getSchoolId())
                .orElseThrow(() -> new RuntimeException("School not found"));

        SchoolCalendar calendar = new SchoolCalendar();
        calendar.setSchool(school);
        calendar.setDate(dto.getDate());
        calendar.setStatus(SchoolCalendar.Status.valueOf(dto.getStatus()));
        calendar.setDescription(dto.getDescription());

        SchoolCalendar saved = calendarRepo.save(calendar);
        dto.setCalendarId(saved.getCalendarId());
        return dto;
    }

    // Auto-generate calendar for a date range
    public void generateSchoolCalendar(Long schoolId, LocalDate startDate, LocalDate endDate, List<LocalDate> specialHolidays) {
        School school = schoolRepo.findById(schoolId)
                .orElseThrow(() -> new RuntimeException("School not found"));

        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {

            // Skip if already exists
            boolean exists = calendarRepo.findBySchool_SchoolIdAndDate(schoolId, current).size() > 0;
            if (exists) {
                current = current.plusDays(1);
                continue;
            }

            SchoolCalendar calendar = new SchoolCalendar();
            calendar.setSchool(school);
            calendar.setDate(current);

            // Default: Sunday = HOLIDAY, or special holiday
            if (current.getDayOfWeek() == DayOfWeek.SUNDAY || (specialHolidays != null && specialHolidays.contains(current))) {
                calendar.setStatus(SchoolCalendar.Status.HOLIDAY);
                calendar.setDescription("Holiday");
            } else {
                calendar.setStatus(SchoolCalendar.Status.WORKING);
                calendar.setDescription("Working Day");
            }

            calendarRepo.save(calendar);
            current = current.plusDays(1);
        }
    }

    // Get calendar by school
    public List<SchoolCalendarDTO> getCalendarBySchool(Long schoolId) {
        List<SchoolCalendar> list = calendarRepo.findBySchool_SchoolId(schoolId);
        return list.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Update a calendar entry
    public SchoolCalendarDTO updateCalendarEntry(Long calendarId, SchoolCalendarDTO dto) {
        SchoolCalendar existing = calendarRepo.findById(calendarId)
                .orElseThrow(() -> new RuntimeException("Calendar entry not found"));

        existing.setStatus(SchoolCalendar.Status.valueOf(dto.getStatus()));
        existing.setDescription(dto.getDescription());
        existing.setDate(dto.getDate());

        calendarRepo.save(existing);

        return convertToDTO(existing);
    }

    // Helper: convert entity to DTO
    private SchoolCalendarDTO convertToDTO(SchoolCalendar calendar) {
        return new SchoolCalendarDTO(
                calendar.getCalendarId(),
                calendar.getSchool().getSchoolId(),
                calendar.getDate(),
                calendar.getStatus().name(),
                calendar.getDescription()
        );
    }
}
