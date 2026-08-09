package edu.example.edu.Controller;

import java.io.IOException;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import edu.example.edu.DTO.SyllabusDTO;
import edu.example.edu.Service.SyllabusService;

@RestController
@RequestMapping("/api/syllabus")
public class SyllabusController {

    private final SyllabusService syllabusService;

    public SyllabusController(SyllabusService syllabusService) {
        this.syllabusService = syllabusService;
    }

    // Create or update
    @PostMapping(consumes = { "multipart/form-data" })
    @PreAuthorize("hasAnyAuthority('CRT','ROLE_CRT','STUDENT','ROLE_STUDENT','TEACHER','ROLE_TEACHER','SCHOOLADMIN','ROLE_SCHOOLADMIN','PRINCIPAL','ROLE_PRINCIPAL','ADMIN','ROLE_ADMIN')")
    public SyllabusDTO createOrUpdate(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("classSubjectId") Long classSubjectId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("moduleName") String moduleName,
            @RequestParam("uploadedById") Long uploadedById) throws IOException {

        SyllabusDTO dto = new SyllabusDTO();
        dto.setClassSubjectId(classSubjectId);
        dto.setTitle(title);
        dto.setDescription(description);
        dto.setModuleName(moduleName);
        dto.setUploadedById(uploadedById);

        if (file != null && !file.isEmpty()) {
            String projectRoot = System.getProperty("user.dir");
            String uploadDir = projectRoot + java.io.File.separator + "uploads" + java.io.File.separator + "syllabus"
                    + java.io.File.separator;
            java.io.File directory = new java.io.File(uploadDir);
            if (!directory.exists())
                directory.mkdirs();

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            java.io.File dest = new java.io.File(uploadDir + fileName);
            file.transferTo(dest);
            dto.setFileLink("/api/syllabus/files/" + fileName);
        }

        return syllabusService.saveSyllabus(dto);
    }

    // Get file
    @GetMapping("/files/{fileName}")
    public ResponseEntity<Resource> getFile(@PathVariable String fileName) throws java.io.IOException {
        String projectRoot = System.getProperty("user.dir");
        String filePath = projectRoot + java.io.File.separator + "uploads" + java.io.File.separator + "syllabus"
                + java.io.File.separator + fileName;
        java.io.File file = new java.io.File(filePath);
        if (!file.exists())
            return ResponseEntity.notFound().build();

        Resource resource = new UrlResource(file.toURI());

        String contentType = "application/octet-stream";
        if (fileName.endsWith(".pdf"))
            contentType = "application/pdf";
        else if (fileName.endsWith(".ppt"))
            contentType = "application/vnd.ms-powerpoint";
        else if (fileName.endsWith(".pptx"))
            contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getName() + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    // Get all syllabuses
    @GetMapping
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public List<SyllabusDTO> getAll() {
        return syllabusService.getAllSyllabuses();
    }

    // Get by classSubjectId
    @GetMapping("/classSubject/{id}")
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public List<SyllabusDTO> getByClassSubject(@PathVariable Long id) {
        return syllabusService.getByClassSubject(id);
    }

    // Delete
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SCHOOLADMIN','PRINCIPAL','ADMIN')")
    public String delete(@PathVariable Long id) {
        syllabusService.deleteSyllabus(id);
        return "Syllabus deleted successfully";
    }
}
