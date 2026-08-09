package edu.example.edu.Controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.example.edu.DTO.ClassroomDTO;
import edu.example.edu.Service.ClassroomService;

@RestController
@RequestMapping("/api/classrooms")
public class ClassroomController {

    private final ClassroomService classroomService;

    public ClassroomController(ClassroomService classroomService) {
        this.classroomService = classroomService;
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('SCHOOLADMIN','PRINCIPAL')")
    public ClassroomDTO createClassroom(@RequestBody ClassroomDTO dto) {
        return classroomService.createClassroom(dto);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public List<ClassroomDTO> getAllClassrooms() {
        return classroomService.getAllClassrooms();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public ClassroomDTO getClassroomById(@PathVariable Long id) {
        return classroomService.getClassroomById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SCHOOLADMIN','PRINCIPAL')")
    public ClassroomDTO updateClassroom(@PathVariable Long id, @RequestBody ClassroomDTO dto) {
        return classroomService.updateClassroom(id, dto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SCHOOLADMIN','PRINCIPAL','ADMIN')")
    public void deleteClassroom(@PathVariable Long id) {
        classroomService.deleteClassroom(id);
    }
}
