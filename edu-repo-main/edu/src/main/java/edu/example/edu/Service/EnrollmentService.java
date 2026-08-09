package edu.example.edu.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import edu.example.edu.DTO.EnrollmentDTO;
import edu.example.edu.Entity.Classroom;
import edu.example.edu.Entity.Enrollment;
import edu.example.edu.Entity.User;
import edu.example.edu.Repository.ClassroomRepository;
import edu.example.edu.Repository.EnrollmentRepository;
import edu.example.edu.Repository.UserRepository;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;

    public EnrollmentService(EnrollmentRepository enrollmentRepository,
                             ClassroomRepository classroomRepository,
                             UserRepository userRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.classroomRepository = classroomRepository;
        this.userRepository = userRepository;
    }

    private EnrollmentDTO convertToDTO(Enrollment enrollment) {
        EnrollmentDTO dto = new EnrollmentDTO();
        dto.setEnrollmentId(enrollment.getEnrollmentId());
        dto.setClassroomId(enrollment.getClassroom().getClassId());
        dto.setStudentId(enrollment.getStudent().getUserId());
        dto.setStudentName(enrollment.getStudent().getName());
        dto.setEnrollmentDate(enrollment.getEnrollmentDate());
        return dto;
    }

    public EnrollmentDTO enrollStudent(EnrollmentDTO dto) {
        Classroom classroom = classroomRepository.findById(dto.getClassroomId())
                .orElseThrow(() -> new RuntimeException("Classroom not found with id " + dto.getClassroomId()));

        User student = userRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found with id " + dto.getStudentId()));

        // Check role
        if (!student.getRole().name().equals("STUDENT")) {
            throw new RuntimeException("User with id " + dto.getStudentId() + " is not a student");
        }

        // ✅ IMPORTANT: update student's classroom
        student.setClassroom(classroom);
        userRepository.save(student);

        Enrollment enrollment = new Enrollment();
        enrollment.setClassroom(classroom);
        enrollment.setStudent(student);
        enrollment.setEnrollmentDate(dto.getEnrollmentDate() != null ? dto.getEnrollmentDate() : LocalDate.now());

        Enrollment saved = enrollmentRepository.save(enrollment);
        return convertToDTO(saved);
}


    // Get all enrollments
    public List<EnrollmentDTO> getAllEnrollments() {
        return enrollmentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get enrollment by ID
    public EnrollmentDTO getEnrollmentById(Long id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found with id " + id));
        return convertToDTO(enrollment);
    }

    // Delete enrollment
    public void deleteEnrollment(Long id) {
        enrollmentRepository.deleteById(id);
    }
}
