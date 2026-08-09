package edu.example.edu.Controller;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import edu.example.edu.DTO.SubmissionDTO;
import edu.example.edu.DTO.SubmissionComplianceDTO;
import edu.example.edu.Service.SubmissionService;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    // ✅ Upload a file
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('CRT','ROLE_CRT','STUDENT','ROLE_STUDENT','TEACHER','ROLE_TEACHER','SCHOOLADMIN','ROLE_SCHOOLADMIN','PRINCIPAL','ROLE_PRINCIPAL','ADMIN','ROLE_ADMIN')")

    public SubmissionDTO uploadSubmission(
            @RequestParam("file") MultipartFile file,
            @RequestParam("assignmentId") Long assignmentId,
            @RequestParam("studentId") Long studentId) throws IOException {

        System.out.println(">>> SUBMISSION CONTROLLER: Received upload request");
        System.out.println(">>> AssignmentId: " + assignmentId + ", StudentId: " + studentId);
        System.out.println(">>> File: " + (file != null ? file.getOriginalFilename() : "No file"));

        String projectRoot = System.getProperty("user.dir");
        String uploadDir = projectRoot + File.separator + "uploads" + File.separator + "submissions" + File.separator;
        File directory = new File(uploadDir);
        if (!directory.exists())
            directory.mkdirs();

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        File dest = new File(uploadDir + fileName);
        file.transferTo(dest);

        SubmissionDTO dto = new SubmissionDTO();
        dto.setAssignmentId(assignmentId);
        dto.setStudentId(studentId);
        dto.setFileLink("/api/submissions/files/" + fileName);
        dto.setSubmissionDate(LocalDate.now());

        return submissionService.saveSubmission(dto);
    }

    // ✅ Download file
    @GetMapping("/files/{fileName}")
    public ResponseEntity<Resource> getFile(@PathVariable String fileName) throws IOException {
        String projectRoot = System.getProperty("user.dir");
        String filePath = projectRoot + File.separator + "uploads" + File.separator + "submissions" + File.separator
                + fileName;
        File file = new File(filePath);
        if (!file.exists())
            return ResponseEntity.notFound().build();

        Resource resource = new UrlResource(file.toURI());

        String contentType;
        if (fileName.endsWith(".pdf"))
            contentType = "application/pdf";
        else if (fileName.endsWith(".doc"))
            contentType = "application/msword";
        else if (fileName.endsWith(".docx"))
            contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        else if (fileName.endsWith(".xls"))
            contentType = "application/vnd.ms-excel";
        else if (fileName.endsWith(".xlsx"))
            contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        else
            contentType = "application/octet-stream";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getName() + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    // ✅ Get all submissions
    @GetMapping
    @PreAuthorize("hasAnyAuthority('TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public List<SubmissionDTO> getAllSubmissions() {
        return submissionService.getAllSubmissions();
    }

    // ✅ Get submissions by assignment (all submissions for teachers/admins)
    @GetMapping("/assignment/{assignmentId}")
    @PreAuthorize("hasAnyAuthority('TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public List<SubmissionDTO> getSubmissionsByAssignment(@PathVariable Long assignmentId) {
        return submissionService.getSubmissionsByAssignment(assignmentId);
    }

    // ✅ Get submissions by assignment + student (only student’s own)
    @GetMapping("/assignment/{assignmentId}/student/{studentId}")
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public List<SubmissionDTO> getSubmissionsByAssignmentAndStudent(
            @PathVariable Long assignmentId,
            @PathVariable Long studentId) {
        return submissionService.getSubmissionsByAssignmentAndStudent(assignmentId, studentId);
    }

    // ✅ Grade submission
    @PutMapping("/grade/{submissionId}")
    @PreAuthorize("hasAnyAuthority('TEACHER','SCHOOLADMIN')")
    public SubmissionDTO gradeSubmission(@PathVariable Long submissionId,
            @RequestParam String grade) {
        System.out.println("Grading submissionId " + submissionId + " with grade: " + grade);
        return submissionService.gradeSubmission(submissionId, grade);
    }

    // ✅ Delete submission
    @DeleteMapping("/{submissionId}")
    @PreAuthorize("hasAnyAuthority('SCHOOLADMIN','PRINCIPAL','ADMIN')")
    public String deleteSubmission(@PathVariable Long submissionId) {
        submissionService.deleteSubmission(submissionId);
        return "Submission deleted successfully";
    }

    @PutMapping("/grade-feedback/{submissionId}")
    @PreAuthorize("hasAnyAuthority('TEACHER','SCHOOLADMIN')")
    public SubmissionDTO updateGradeAndFeedback(
            @PathVariable Long submissionId,
            @RequestParam String grade,
            @RequestParam String feedback) {

        return submissionService.updateGradeAndFeedback(submissionId, grade, feedback);
    }

    @GetMapping("/assignment/{assignmentId}/compliance")
    @PreAuthorize("hasAnyAuthority('TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public SubmissionComplianceDTO getSubmissionCompliance(@PathVariable Long assignmentId) {
        return submissionService.getSubmissionCompliance(assignmentId);
    }

}
