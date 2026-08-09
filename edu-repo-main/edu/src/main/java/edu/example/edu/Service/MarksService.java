package edu.example.edu.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.example.edu.DTO.MarksDTO;
import edu.example.edu.Entity.ExamSchedule;
import edu.example.edu.Entity.Marks;
import edu.example.edu.Entity.Subject;
import edu.example.edu.Entity.User;
import edu.example.edu.Repository.ExamScheduleRepository;
import edu.example.edu.Repository.MarksRepository;
import edu.example.edu.Repository.SubjectRepository;
import edu.example.edu.Repository.UserRepository;

@Service
public class MarksService {

    @Autowired
    private MarksRepository marksRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private ExamScheduleRepository examScheduleRepository;

    // Convert Entity to DTO
    private MarksDTO toDTO(Marks marks) {
        MarksDTO dto = new MarksDTO();
        dto.setMarksId(marks.getMarksId());
        dto.setStudentId(marks.getStudent().getUserId());
        dto.setStudentName(marks.getStudent().getName());
        dto.setSubjectId(marks.getSubject().getSubjectId());
        dto.setSubjectName(marks.getSubject().getName());
        dto.setExamType(marks.getExamType());
        dto.setMarksObtained(marks.getMarksObtained());
        dto.setTotalMarks(marks.getTotalMarks());
        dto.setExamDate(marks.getExamDate());

        // include schedule id
        if (marks.getExamSchedule() != null) {
            dto.setExamScheduleId(marks.getExamSchedule().getExamScheduleId());
        }

        return dto;
    }

    // Convert DTO to Entity
    private Marks toEntity(MarksDTO dto) {
        Marks marks = new Marks();
        marks.setMarksId(dto.getMarksId());

        User student = userRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        ExamSchedule examSchedule = examScheduleRepository.findById(dto.getExamScheduleId())
                .orElseThrow(() -> new RuntimeException("Exam schedule not found"));

        marks.setStudent(student);
        marks.setSubject(subject);
        marks.setExamSchedule(examSchedule);
        marks.setExamType(dto.getExamType());
        marks.setMarksObtained(dto.getMarksObtained());
        marks.setTotalMarks(dto.getTotalMarks());
        marks.setExamDate(dto.getExamDate());

        return marks;
    }

    public MarksDTO saveMarks(MarksDTO dto) {

        // CHECK IF student already has marks for this exam
        Optional<Marks> existing = marksRepository
                .findByStudent_UserIdAndExamSchedule_ExamScheduleId(
                        dto.getStudentId(), dto.getExamScheduleId()
                );

        if (existing.isPresent()) {
            // update existing marks, not create new
            dto.setMarksId(existing.get().getMarksId());
            return updateMarks(dto);
        }

        // normal NEW marks save
        Marks marks = toEntity(dto);
        Marks saved = marksRepository.save(marks);
        return toDTO(saved);
    }

    // Get all marks
    public List<MarksDTO> getAllMarks() {
        return marksRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Get marks by student
    public List<MarksDTO> getMarksByStudent(Long studentId) {
        return marksRepository.findByStudent_UserId(studentId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Get marks by subject
    public List<MarksDTO> getMarksBySubject(Long subjectId) {
        return marksRepository.findBySubject_SubjectId(subjectId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Delete marks
    public void deleteMarks(Long marksId) {
        marksRepository.deleteById(marksId);
    }

    // UPDATE marks (PUT)
    public MarksDTO updateMarks(MarksDTO dto) {

        Marks existing = marksRepository.findById(dto.getMarksId())
                .orElseThrow(() -> new RuntimeException("Marks not found"));

        existing.setMarksObtained(dto.getMarksObtained());
        existing.setTotalMarks(dto.getTotalMarks());
        existing.setExamType(dto.getExamType());
        existing.setExamDate(dto.getExamDate());

        // update schedule also
        if (dto.getExamScheduleId() != null) {
            ExamSchedule examSchedule = examScheduleRepository.findById(dto.getExamScheduleId())
                    .orElseThrow(() -> new RuntimeException("Exam schedule not found"));
            existing.setExamSchedule(examSchedule);
        }

        Marks saved = marksRepository.save(existing);
        return toDTO(saved);
    }

}
