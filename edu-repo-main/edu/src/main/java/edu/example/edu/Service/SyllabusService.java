package edu.example.edu.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.example.edu.DTO.SyllabusDTO;
import edu.example.edu.Entity.ClassSubject;
import edu.example.edu.Entity.Syllabus;
import edu.example.edu.Entity.User;
import edu.example.edu.Repository.ClassSubjectRepository;
import edu.example.edu.Repository.SyllabusRepository;
import edu.example.edu.Repository.UserRepository;

@Service
public class SyllabusService {

    @Autowired
    private SyllabusRepository syllabusRepository;

    @Autowired
    private ClassSubjectRepository classSubjectRepository;

    @Autowired
    private UserRepository userRepository;

    // ✅ Create or update syllabus
    public SyllabusDTO saveSyllabus(SyllabusDTO syllabusDTO) {
        Syllabus syllabus = new Syllabus();

        if (syllabusDTO.getSyllabusId() != null) {
            syllabus = syllabusRepository.findById(syllabusDTO.getSyllabusId())
                    .orElse(new Syllabus());
        }

        ClassSubject classSubject = classSubjectRepository.findById(syllabusDTO.getClassSubjectId())
                .orElseThrow(() -> new RuntimeException("ClassSubject not found"));

        User uploadedBy = userRepository.findById(syllabusDTO.getUploadedById())
                .orElseThrow(() -> new RuntimeException("User not found"));

        syllabus.setClassSubject(classSubject);
        syllabus.setTitle(syllabusDTO.getTitle());
        syllabus.setDescription(syllabusDTO.getDescription());
        syllabus.setModuleName(syllabusDTO.getModuleName());
        syllabus.setFileLink(syllabusDTO.getFileLink());
        syllabus.setUploadedBy(uploadedBy);
        syllabus.setUploadedAt(LocalDateTime.now());

        Syllabus saved = syllabusRepository.save(syllabus);
        return convertToDTO(saved);
    }

    // ✅ Get all syllabuses
    public List<SyllabusDTO> getAllSyllabuses() {
        return syllabusRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ✅ Get by classSubjectId
    public List<SyllabusDTO> getByClassSubject(Long classSubjectId) {
        return syllabusRepository.findByClassSubject_Id(classSubjectId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ✅ Get by ID
    public SyllabusDTO getSyllabusById(Long id) {
        Syllabus syllabus = syllabusRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Syllabus not found"));
        return convertToDTO(syllabus);
    }

    // ✅ Delete
    public void deleteSyllabus(Long id) {
        if (!syllabusRepository.existsById(id)) {
            throw new RuntimeException("Syllabus not found");
        }
        syllabusRepository.deleteById(id);
    }

    // ✅ Helper: Entity → DTO
    private SyllabusDTO convertToDTO(Syllabus syllabus) {
        SyllabusDTO dto = new SyllabusDTO();
        dto.setSyllabusId(syllabus.getSyllabusId());
        dto.setClassSubjectId(syllabus.getClassSubject().getId());
        dto.setTitle(syllabus.getTitle());
        dto.setDescription(syllabus.getDescription());
        dto.setModuleName(syllabus.getModuleName());
        dto.setFileLink(syllabus.getFileLink());
        dto.setUploadedById(syllabus.getUploadedBy().getUserId());
        dto.setUploadedAt(syllabus.getUploadedAt());
        return dto;
    }
}
