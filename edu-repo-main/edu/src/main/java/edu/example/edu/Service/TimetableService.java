
package edu.example.edu.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import edu.example.edu.DTO.TimetableDTO;
import edu.example.edu.Entity.Classroom;
import edu.example.edu.Entity.Subject;
import edu.example.edu.Entity.Timetable;
import edu.example.edu.Entity.User;
import edu.example.edu.Repository.ClassSubjectRepository;
import edu.example.edu.Repository.ClassroomRepository;
import edu.example.edu.Repository.SubjectRepository;
import edu.example.edu.Repository.TimetableRepository;
import edu.example.edu.Repository.UserRepository;

@Service
public class TimetableService {

    private final TimetableRepository timetableRepository;
    private final ClassroomRepository classroomRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final ClassSubjectRepository classSubjectRepository;

    public TimetableService(
            TimetableRepository timetableRepository,
            ClassroomRepository classroomRepository,
            SubjectRepository subjectRepository,
            UserRepository userRepository,
            ClassSubjectRepository classSubjectRepository) {

        this.timetableRepository = timetableRepository;
        this.classroomRepository = classroomRepository;
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
        this.classSubjectRepository = classSubjectRepository;
    }

    // Convert Entity to DTO
    private TimetableDTO convertToDTO(Timetable t) {
        TimetableDTO dto = new TimetableDTO();
        dto.setTimetableId(t.getTimetableId());
        dto.setClassroomId(t.getClassroom().getClassId());
        dto.setSubjectId(t.getSubject().getSubjectId());
        dto.setTeacherId(t.getTeacher() != null ? t.getTeacher().getUserId() : null);
        dto.setDayOfWeek(t.getDayOfWeek().name());
        dto.setPeriodNumber(t.getPeriodNumber());
        return dto;
    }

    // ---------------- CREATE ----------------
    public TimetableDTO createTimetable(TimetableDTO dto) {
        Classroom classroom = classroomRepository.findById(dto.getClassroomId())
                .orElseThrow(() -> new RuntimeException("Classroom not found"));

        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        User teacher = null;
        if (dto.getTeacherId() != null) {
            teacher = userRepository.findById(dto.getTeacherId())
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            // 1️⃣ ensure teacher is actually assigned for this class & subject
            boolean isAssigned = classSubjectRepository
                    .existsByClassroomAndSubjectAndTeacher(classroom, subject, teacher);

            if (!isAssigned) {
                throw new RuntimeException("Teacher is not assigned to this class and subject");
            }

            // 2️⃣ prevent teacher collision: same teacher, same day, same period
            Timetable.DayOfWeek dayEnum = Timetable.DayOfWeek.valueOf(dto.getDayOfWeek());
            boolean exists = timetableRepository.existsByTeacherAndDayOfWeekAndPeriodNumber(
                    teacher,
                    dayEnum,
                    dto.getPeriodNumber());

            if (exists) {
                Timetable conflict = timetableRepository.findFirstByTeacherAndDayOfWeekAndPeriodNumber(
                        teacher, dayEnum, dto.getPeriodNumber()).orElse(null);

                String className = (conflict != null) ? conflict.getClassroom().getName() : "another class";
                throw new RuntimeException("Teacher is already alloted to class " + className + " at this time");
            }
        }

        Timetable t = new Timetable();
        t.setClassroom(classroom);
        t.setSubject(subject);
        t.setTeacher(teacher);
        t.setDayOfWeek(Timetable.DayOfWeek.valueOf(dto.getDayOfWeek()));
        t.setPeriodNumber(dto.getPeriodNumber());

        return convertToDTO(timetableRepository.save(t));
    }

    // ---------------- UPDATE ----------------
    public TimetableDTO updateTimetable(Long id, TimetableDTO dto) {
        Timetable t = timetableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Timetable not found"));

        // classroom
        if (dto.getClassroomId() != null) {
            Classroom classroom = classroomRepository.findById(dto.getClassroomId())
                    .orElseThrow(() -> new RuntimeException("Classroom not found"));
            t.setClassroom(classroom);
        }

        // subject
        if (dto.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(dto.getSubjectId())
                    .orElseThrow(() -> new RuntimeException("Subject not found"));
            t.setSubject(subject);
        }

        // day & period (we compute effective values for collision check)
        Timetable.DayOfWeek newDay = t.getDayOfWeek();
        if (dto.getDayOfWeek() != null) {
            newDay = Timetable.DayOfWeek.valueOf(dto.getDayOfWeek());
            t.setDayOfWeek(newDay);
        }

        Integer newPeriod = t.getPeriodNumber();
        if (dto.getPeriodNumber() != null) {
            newPeriod = dto.getPeriodNumber();
            t.setPeriodNumber(newPeriod);
        }

        // teacher
        if (dto.getTeacherId() != null) {
            User teacher = userRepository.findById(dto.getTeacherId())
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            // 1️⃣ ensure teacher is actually assigned for this class & subject
            boolean isAssigned = classSubjectRepository
                    .existsByClassroomAndSubjectAndTeacher(t.getClassroom(), t.getSubject(), teacher);

            if (!isAssigned) {
                throw new RuntimeException("Teacher is not assigned to this class and subject");
            }

            // 2️⃣ collision check – ignore current timetable row (id)
            boolean exists = timetableRepository
                    .existsByTeacherAndDayOfWeekAndPeriodNumberAndTimetableIdNot(
                            teacher,
                            newDay,
                            newPeriod,
                            t.getTimetableId());

            if (exists) {
                Timetable conflict = timetableRepository.findFirstByTeacherAndDayOfWeekAndPeriodNumberAndTimetableIdNot(
                        teacher, newDay, newPeriod, t.getTimetableId()).orElse(null);

                String className = (conflict != null) ? conflict.getClassroom().getName() : "another class";
                throw new RuntimeException("Teacher is already alloted to class " + className + " at this time");
            }

            t.setTeacher(teacher);
        }

        return convertToDTO(timetableRepository.save(t));
    }

    // ---------------- GET ALL ----------------
    public List<TimetableDTO> getAllTimetables() {
        return timetableRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ---------------- GET BY ID ----------------
    public TimetableDTO getTimetableById(Long id) {
        Timetable t = timetableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Timetable not found"));
        return convertToDTO(t);
    }

    // ---------------- DELETE ----------------
    public void deleteTimetable(Long id) {
        timetableRepository.deleteById(id);
    }

    // Get teachers for class and subject
    public List<User> getTeachersForClassSubject(Long classId, Long subjectId) {
        Classroom classroom = classroomRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        return classSubjectRepository.findByClassroomAndSubject(classroom, subject)
                .stream()
                .map(cs -> cs.getTeacher())
                .collect(Collectors.toList());
    }

    // FINAL DTO method for Student & Teacher
    public List<TimetableDTO> getTimetableDTOsByClass(Long classId) {
        return timetableRepository.findByClassroom_ClassId(classId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}
