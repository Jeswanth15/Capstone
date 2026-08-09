package edu.example.edu.Service;

import edu.example.edu.DTO.TeachingLogDTO;
import edu.example.edu.Entity.*;
import edu.example.edu.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeachingLogService {

    @Autowired
    private TeachingLogRepository teachingLogRepository;

    @Autowired
    private ClassSubjectRepository classSubjectRepository;

    @Autowired
    private UserRepository userRepository;

    // ✅ Create or update
    public TeachingLogDTO saveTeachingLog(TeachingLogDTO dto) {
        TeachingLog log = new TeachingLog();

        if (dto.getId() != null) {
            log = teachingLogRepository.findById(dto.getId())
                    .orElse(new TeachingLog());
        }

        ClassSubject classSubject = classSubjectRepository.findById(dto.getClassSubjectId())
                .orElseThrow(() -> new RuntimeException("ClassSubject not found"));
        User teacher = userRepository.findById(dto.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        log.setClassSubject(classSubject);
        log.setTeacher(teacher);
        log.setTopicTaught(dto.getTopicTaught());
        log.setTaughtAt(LocalDateTime.now());

        TeachingLog saved = teachingLogRepository.save(log);
        return convertToDTO(saved);
    }

    // ✅ Get all logs
    public List<TeachingLogDTO> getAllLogs() {
        return teachingLogRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ✅ Get logs by ClassSubject
    public List<TeachingLogDTO> getByClassSubject(Long id) {
        return teachingLogRepository.findByClassSubject_Id(id)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ✅ Get logs by Teacher
    public List<TeachingLogDTO> getByTeacher(Long id) {
        return teachingLogRepository.findByTeacher_UserId(id)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ✅ Delete log
    public void deleteTeachingLog(Long id) {
        if (!teachingLogRepository.existsById(id)) {
            throw new RuntimeException("Teaching log not found");
        }
        teachingLogRepository.deleteById(id);
    }

    // 🔁 Helper
    private TeachingLogDTO convertToDTO(TeachingLog log) {
        TeachingLogDTO dto = new TeachingLogDTO();
        dto.setId(log.getId());
        dto.setClassSubjectId(log.getClassSubject().getId());
        dto.setTeacherId(log.getTeacher().getUserId());
        dto.setTopicTaught(log.getTopicTaught());
        dto.setTaughtAt(log.getTaughtAt());
        return dto;
    }
}
