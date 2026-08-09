package edu.example.edu.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.example.edu.DTO.AttendanceDTO;
import edu.example.edu.Entity.Attendance;
import edu.example.edu.Entity.Classroom;
import edu.example.edu.Entity.SchoolCalendar;
import edu.example.edu.Entity.Subject;
import edu.example.edu.Entity.User;
import edu.example.edu.Repository.AttendanceRepository;
import edu.example.edu.Repository.ClassroomRepository;
import edu.example.edu.Repository.SchoolCalendarRepository;
import edu.example.edu.Repository.SubjectRepository;
import edu.example.edu.Repository.UserRepository;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ClassroomRepository classroomRepo;

    @Autowired
    private SubjectRepository subjectRepo;

    @Autowired
    private SchoolCalendarRepository calendarRepo;

    // ---------------- CREATE ----------------
    public AttendanceDTO createAttendance(AttendanceDTO dto) {

        User student = userRepo.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Classroom classroom = classroomRepo.findById(dto.getClassroomId())
                .orElseThrow(() -> new RuntimeException("Classroom not found"));

        Subject subject = subjectRepo.findById(dto.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        Attendance attendance = new Attendance();
        attendance.setStudent(student);
        attendance.setClassroom(classroom);
        attendance.setSubject(subject);
        attendance.setDate(dto.getDate());
        attendance.setPeriodNumber(dto.getPeriodNumber());
        attendance.setStatus(Attendance.Status.valueOf(dto.getStatus()));

        if (dto.getCalendarId() != null) {
            SchoolCalendar calendar = calendarRepo.findById(dto.getCalendarId())
                    .orElseThrow(() -> new RuntimeException("Calendar not found"));
            attendance.setSchoolCalendar(calendar);
        }

        Attendance saved = attendanceRepo.save(attendance);
        return convertToDTO(saved);
    }

    // ---------------- UPDATE ----------------
    public AttendanceDTO updateAttendance(Long attendanceId, AttendanceDTO dto) {

        Attendance existing = attendanceRepo.findByAttendanceId(attendanceId)
                .orElseThrow(() -> new RuntimeException("Attendance not found"));

        existing.setStatus(Attendance.Status.valueOf(dto.getStatus()));
        existing.setDate(dto.getDate());
        existing.setPeriodNumber(dto.getPeriodNumber());

        Attendance saved = attendanceRepo.save(existing);
        return convertToDTO(saved);
    }

    // ---------------- DELETE ----------------
    public void deleteAttendance(Long attendanceId) {
        Attendance existing = attendanceRepo.findByAttendanceId(attendanceId)
                .orElseThrow(() -> new RuntimeException("Attendance not found"));
        attendanceRepo.delete(existing);
    }

    // ---------------- GET BY STUDENT ----------------
    public List<AttendanceDTO> getAttendanceByStudent(Long studentId) {
        return attendanceRepo.findByStudent_UserId(studentId)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // ---------------- GET BY CLASS+SUBJECT+DATE+PERIOD ----------------
    public List<AttendanceDTO> getAttendanceByClassDatePeriod(
            Long classId, Long subjectId, LocalDate date, int periodNumber) {

        return attendanceRepo
                .findByClassroom_ClassIdAndSubject_SubjectIdAndDateAndPeriodNumber(
                        classId, subjectId, date, periodNumber)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ---------------- CONVERTER ----------------
    private AttendanceDTO convertToDTO(Attendance a) {
        return new AttendanceDTO(
                a.getAttendanceId(),
                a.getStudent().getUserId(),
                a.getClassroom().getClassId(),
                a.getSubject().getSubjectId(),
                a.getSchoolCalendar() != null ? a.getSchoolCalendar().getCalendarId() : null,
                a.getDate(),
                a.getPeriodNumber(),
                a.getStatus().name()
        );
    }
}
