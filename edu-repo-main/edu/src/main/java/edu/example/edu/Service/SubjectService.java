package edu.example.edu.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import edu.example.edu.DTO.SubjectDTO;
import edu.example.edu.Entity.Subject;
import edu.example.edu.Repository.SubjectRepository;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public SubjectService(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    // Convert Entity -> DTO
    private SubjectDTO convertToDTO(Subject subject) {
        SubjectDTO dto = new SubjectDTO();
        dto.setSubjectId(subject.getSubjectId());
        dto.setName(subject.getName());
        dto.setCode(subject.getCode());
        return dto;
    }

    // Create subject
    public SubjectDTO createSubject(SubjectDTO dto) {
        Subject subject = new Subject();
        subject.setName(dto.getName());
        subject.setCode(dto.getCode());
        Subject saved = subjectRepository.save(subject);
        return convertToDTO(saved);
    }

    // Get all subjects
    public List<SubjectDTO> getAllSubjects() {
        return subjectRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get subject by ID
    public SubjectDTO getSubjectById(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found with id " + id));
        return convertToDTO(subject);
    }

    // Update subject
    public SubjectDTO updateSubject(Long id, SubjectDTO dto) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found with id " + id));
        subject.setName(dto.getName());
        subject.setCode(dto.getCode());
        Subject updated = subjectRepository.save(subject);
        return convertToDTO(updated);
    }

    // Delete subject
    public void deleteSubject(Long id) {
        subjectRepository.deleteById(id);
    }
}
