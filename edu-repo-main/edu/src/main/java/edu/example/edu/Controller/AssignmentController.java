package edu.example.edu.Controller;

import java.util.List;
import java.io.File;
import java.io.IOException;
import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import edu.example.edu.DTO.AssignmentDTO;
import edu.example.edu.Service.AssignmentService;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    @Autowired
    private AssignmentService assignmentService;

    @PostMapping(consumes = { "multipart/form-data" })
    @PreAuthorize("hasAnyAuthority('CRT','ROLE_CRT','STUDENT','ROLE_STUDENT','TEACHER','ROLE_TEACHER','SCHOOLADMIN','ROLE_SCHOOLADMIN','PRINCIPAL','ROLE_PRINCIPAL','ADMIN','ROLE_ADMIN')")
    public ResponseEntity<AssignmentDTO> saveAssignment(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("classroomId") Long classroomId,
            @RequestParam("subjectId") Long subjectId,
            @RequestParam("teacherId") Long teacherId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("dueDate") String dueDate) throws IOException {

        AssignmentDTO dto = new AssignmentDTO();
        dto.setClassroomId(classroomId);
        dto.setSubjectId(subjectId);
        dto.setTeacherId(teacherId);
        dto.setTitle(title);
        dto.setDescription(description);
        dto.setDueDate(LocalDate.parse(dueDate));

        if (file != null && !file.isEmpty()) {
            String projectRoot = System.getProperty("user.dir");
            String uploadDir = projectRoot + java.io.File.separator + "uploads" + java.io.File.separator + "assignments"
                    + java.io.File.separator;
            File directory = new File(uploadDir);
            if (!directory.exists())
                directory.mkdirs();

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            File dest = new File(uploadDir + fileName);
            file.transferTo(dest);
            dto.setFileLink("/api/assignments/files/" + fileName);
        }

        return ResponseEntity.ok(assignmentService.saveAssignment(dto));
    }

    // Get file
    @GetMapping("/files/{fileName}")
    public ResponseEntity<Resource> getFile(@PathVariable String fileName) throws IOException {
        String projectRoot = System.getProperty("user.dir");
        String filePath = projectRoot + java.io.File.separator + "uploads" + java.io.File.separator + "assignments"
                + java.io.File.separator + fileName;
        File file = new File(filePath);
        if (!file.exists())
            return ResponseEntity.notFound().build();

        Resource resource = new UrlResource(file.toURI());

        String contentType = "application/octet-stream";
        if (fileName.endsWith(".pdf"))
            contentType = "application/pdf";
        else if (fileName.endsWith(".doc"))
            contentType = "application/msword";
        else if (fileName.endsWith(".docx"))
            contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getName() + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    @GetMapping

    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public ResponseEntity<List<AssignmentDTO>> getAllAssignments() {
        return ResponseEntity.ok(assignmentService.getAllAssignments());
    }

    @GetMapping("/classroom/{classroomId}")
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public ResponseEntity<List<AssignmentDTO>> getAssignmentsByClassroom(@PathVariable Long classroomId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByClassroom(classroomId));
    }

    @GetMapping("/teacher/{teacherId}")
    @PreAuthorize("hasAnyAuthority('TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public ResponseEntity<List<AssignmentDTO>> getAssignmentsByTeacher(@PathVariable Long teacherId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByTeacher(teacherId));
    }

    @GetMapping("/subject/{subjectId}")
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public ResponseEntity<List<AssignmentDTO>> getAssignmentsBySubject(@PathVariable Long subjectId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsBySubject(subjectId));
    }

    @DeleteMapping("/{assignmentId}")
    @PreAuthorize("hasAnyAuthority('SCHOOLADMIN','PRINCIPAL','ADMIN')")
    public ResponseEntity<String> deleteAssignment(@PathVariable Long assignmentId) {
        assignmentService.deleteAssignment(assignmentId);
        return ResponseEntity.ok("Assignment deleted successfully");
    }
}
