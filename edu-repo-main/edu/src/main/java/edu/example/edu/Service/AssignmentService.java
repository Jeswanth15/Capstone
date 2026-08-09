package edu.example.edu.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.example.edu.DTO.AssignmentDTO;
import edu.example.edu.Entity.Assignment;
import edu.example.edu.Entity.Classroom;
import edu.example.edu.Entity.Subject;
import edu.example.edu.Entity.User;
import edu.example.edu.Repository.AssignmentRepository;
import edu.example.edu.Repository.ClassroomRepository;
import edu.example.edu.Repository.SubjectRepository;
import edu.example.edu.Repository.UserRepository;

@Service
public class AssignmentService {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private ClassroomRepository classroomRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private UserRepository userRepository;

    // Convert Entity to DTO
    private AssignmentDTO toDTO(Assignment assignment) {
        AssignmentDTO dto = new AssignmentDTO();
        dto.setAssignmentId(assignment.getAssignmentId());
        dto.setClassroomId(assignment.getClassroom().getClassId());
        dto.setSubjectId(assignment.getSubject().getSubjectId());
        dto.setTeacherId(assignment.getTeacher().getUserId());
        dto.setTitle(assignment.getTitle());
        dto.setDescription(assignment.getDescription());
        dto.setDueDate(assignment.getDueDate());
        dto.setFileLink(assignment.getFileLink());
        return dto;
    }

    // Convert DTO to Entity
    private Assignment toEntity(AssignmentDTO dto) {
        Assignment assignment = new Assignment();
        assignment.setAssignmentId(dto.getAssignmentId());

        Classroom classroom = classroomRepository.findById(dto.getClassroomId())
                .orElseThrow(() -> new RuntimeException("Classroom not found"));
        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        User teacher = userRepository.findById(dto.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        assignment.setClassroom(classroom);
        assignment.setSubject(subject);
        assignment.setTeacher(teacher);
        assignment.setTitle(dto.getTitle());
        assignment.setDescription(dto.getDescription());
        assignment.setDueDate(dto.getDueDate());
        assignment.setFileLink(dto.getFileLink());

        return assignment;
    }

    // Save or update assignment
    public AssignmentDTO saveAssignment(AssignmentDTO dto) {
        Assignment assignment = toEntity(dto);
        Assignment saved = assignmentRepository.save(assignment);
        return toDTO(saved);
    }

    // Get all assignments
    public List<AssignmentDTO> getAllAssignments() {
        return assignmentRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Get assignments by classroom
    public List<AssignmentDTO> getAssignmentsByClassroom(Long classroomId) {
        return assignmentRepository.findByClassroom_ClassId(classroomId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Get assignments by teacher
    public List<AssignmentDTO> getAssignmentsByTeacher(Long teacherId) {
        return assignmentRepository.findByTeacher_UserId(teacherId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Get assignments by subject
    public List<AssignmentDTO> getAssignmentsBySubject(Long subjectId) {
        return assignmentRepository.findBySubject_SubjectId(subjectId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Delete assignment
    public void deleteAssignment(Long assignmentId) {
        assignmentRepository.deleteById(assignmentId);
    }
}
