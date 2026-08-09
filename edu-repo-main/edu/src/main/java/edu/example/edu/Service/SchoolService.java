package edu.example.edu.Service;

import edu.example.edu.DTO.SchoolDTO;
import edu.example.edu.Entity.School;
import edu.example.edu.Repository.SchoolRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SchoolService {

    private final SchoolRepository schoolRepository;

    public SchoolService(SchoolRepository schoolRepository) {
        this.schoolRepository = schoolRepository;
    }

    // Convert Entity -> DTO
    private SchoolDTO convertToDTO(School school) {
        SchoolDTO dto = new SchoolDTO();
        dto.setSchoolId(school.getSchoolId());
        dto.setName(school.getName());
        dto.setAddress(school.getAddress());
        dto.setContactInfo(school.getContactInfo());
        return dto;
    }

    // Convert DTO -> Entity
    private School convertToEntity(SchoolDTO dto) {
        School school = new School();
        school.setSchoolId(dto.getSchoolId());
        school.setName(dto.getName());
        school.setAddress(dto.getAddress());
        school.setContactInfo(dto.getContactInfo());
        return school;
    }

    public SchoolDTO createSchool(SchoolDTO dto) {
        School saved = schoolRepository.save(convertToEntity(dto));
        return convertToDTO(saved);
    }

    public List<SchoolDTO> getAllSchools() {
        return schoolRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SchoolDTO getSchoolById(Long id) {
        return schoolRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    public SchoolDTO updateSchool(Long id, SchoolDTO dto) {
        return schoolRepository.findById(id).map(existing -> {
            existing.setName(dto.getName());
            existing.setAddress(dto.getAddress());
            existing.setContactInfo(dto.getContactInfo());
            School updated = schoolRepository.save(existing);
            return convertToDTO(updated);
        }).orElse(null);
    }

    public void deleteSchool(Long id) {
        schoolRepository.deleteById(id);
    }
}
