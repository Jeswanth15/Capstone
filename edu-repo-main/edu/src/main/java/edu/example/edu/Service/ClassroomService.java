package edu.example.edu.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import edu.example.edu.DTO.ClassroomDTO;
import edu.example.edu.Entity.Classroom;
import edu.example.edu.Entity.School;
import edu.example.edu.Entity.User;
import edu.example.edu.Repository.ClassroomRepository;
import edu.example.edu.Repository.SchoolRepository;
import edu.example.edu.Repository.UserRepository;

@Service
public class ClassroomService {

    private final ClassroomRepository classroomRepository;
    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;

    public ClassroomService(ClassroomRepository classroomRepository, 
                            SchoolRepository schoolRepository, 
                            UserRepository userRepository) {
        this.classroomRepository = classroomRepository;
        this.schoolRepository = schoolRepository;
        this.userRepository = userRepository;
    }

    private ClassroomDTO convertToDTO(Classroom classroom) {
    ClassroomDTO dto = new ClassroomDTO();
    dto.setClassId(classroom.getClassId());
    dto.setName(classroom.getName());
    dto.setSection(classroom.getSection());
    dto.setSchoolId(classroom.getSchool() != null ? classroom.getSchool().getSchoolId() : null);
    dto.setClassTeacherId(classroom.getClassTeacher() != null ? classroom.getClassTeacher().getUserId() : null);
    dto.setClassTeacherName(classroom.getClassTeacher() != null ? classroom.getClassTeacher().getName() : "N/A"); // added
    return dto;
}


    // Create classroom
    public ClassroomDTO createClassroom(ClassroomDTO dto) {
        Classroom classroom = new Classroom();
        classroom.setName(dto.getName());
        classroom.setSection(dto.getSection());

        // Set school
        School school = schoolRepository.findById(dto.getSchoolId())
                .orElseThrow(() -> new RuntimeException("School not found with id " + dto.getSchoolId()));
        classroom.setSchool(school);

        // Set class teacher if provided
        if (dto.getClassTeacherId() != null) {
            User teacher = userRepository.findById(dto.getClassTeacherId())
                    .orElseThrow(() -> new RuntimeException("Teacher not found with id " + dto.getClassTeacherId()));

            if (!teacher.getRole().name().equals("TEACHER")) {
                throw new RuntimeException("User with id " + dto.getClassTeacherId() + " is not a teacher");
            }

            classroom.setClassTeacher(teacher);
        }

        Classroom saved = classroomRepository.save(classroom);
        return convertToDTO(saved);
    }

    // Get all classrooms
    public List<ClassroomDTO> getAllClassrooms() {
        return classroomRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get classroom by ID
    public ClassroomDTO getClassroomById(Long id) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Classroom not found with id " + id));
        return convertToDTO(classroom);
    }

    // Update classroom
    public ClassroomDTO updateClassroom(Long id, ClassroomDTO dto) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Classroom not found with id " + id));

        classroom.setName(dto.getName());
        classroom.setSection(dto.getSection());

        if (dto.getSchoolId() != null) {
            School school = schoolRepository.findById(dto.getSchoolId())
                    .orElseThrow(() -> new RuntimeException("School not found with id " + dto.getSchoolId()));
            classroom.setSchool(school);
        }

        if (dto.getClassTeacherId() != null) {
            User teacher = userRepository.findById(dto.getClassTeacherId())
                    .orElseThrow(() -> new RuntimeException("Teacher not found with id " + dto.getClassTeacherId()));

            if (!teacher.getRole().name().equals("TEACHER")) {
                throw new RuntimeException("User with id " + dto.getClassTeacherId() + " is not a teacher");
            }

            classroom.setClassTeacher(teacher);
        }

        Classroom updated = classroomRepository.save(classroom);
        return convertToDTO(updated);
    }

    // Delete classroom
    public void deleteClassroom(Long id) {
        classroomRepository.deleteById(id);
    }
}