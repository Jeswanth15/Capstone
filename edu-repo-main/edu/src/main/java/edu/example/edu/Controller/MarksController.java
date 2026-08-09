package edu.example.edu.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.example.edu.DTO.MarksDTO;
import edu.example.edu.Service.MarksService;

@RestController
@RequestMapping("/api/marks")
public class MarksController {

    @Autowired
    private MarksService marksService;

    // Create or Update Marks
    @PostMapping
    @PreAuthorize("hasAnyAuthority('TEACHER','PRINCIPAL','SCHOOLADMIN','ADMIN')")
    public ResponseEntity<MarksDTO> saveMarks(@RequestBody MarksDTO marksDTO) {
        return ResponseEntity.ok(marksService.saveMarks(marksDTO));
    }

    // Get all marks
    @GetMapping
    @PreAuthorize("hasAnyAuthority('TEACHER','PRINCIPAL','SCHOOLADMIN','ADMIN')")
    public ResponseEntity<List<MarksDTO>> getAllMarks() {
        return ResponseEntity.ok(marksService.getAllMarks());
    }

    // Get marks by student
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','PRINCIPAL','SCHOOLADMIN','ADMIN')")
    public ResponseEntity<List<MarksDTO>> getMarksByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(marksService.getMarksByStudent(studentId));
    }

    // Get marks by subject
    @GetMapping("/subject/{subjectId}")
    @PreAuthorize("hasAnyAuthority('TEACHER','PRINCIPAL','SCHOOLADMIN','ADMIN')")
    public ResponseEntity<List<MarksDTO>> getMarksBySubject(@PathVariable Long subjectId) {
        return ResponseEntity.ok(marksService.getMarksBySubject(subjectId));
    }

    // Delete marks
    @DeleteMapping("/{marksId}")
    @PreAuthorize("hasAnyAuthority('PRINCIPAL','SCHOOLADMIN','ADMIN')")
    public ResponseEntity<String> deleteMarks(@PathVariable Long marksId) {
        marksService.deleteMarks(marksId);
        return ResponseEntity.ok("Marks deleted successfully");
    }
    

        // UPDATE MARKS (PUT)
    @PutMapping("/{marksId}")
    @PreAuthorize("hasAnyAuthority('TEACHER','PRINCIPAL','SCHOOLADMIN','ADMIN')")
    public ResponseEntity<MarksDTO> updateMarks(
            @PathVariable Long marksId,
            @RequestBody MarksDTO marksDTO) {

        marksDTO.setMarksId(marksId);
        return ResponseEntity.ok(marksService.updateMarks(marksDTO));
    }

}