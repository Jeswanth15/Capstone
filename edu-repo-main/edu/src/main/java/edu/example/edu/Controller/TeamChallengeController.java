package edu.example.edu.Controller;

import edu.example.edu.DTO.*;
import edu.example.edu.Entity.Classroom;
import edu.example.edu.Entity.Subject;
import edu.example.edu.Entity.User;
import edu.example.edu.Service.TeamChallengeService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/team-challenges")
public class TeamChallengeController {

    private final TeamChallengeService teamChallengeService;

    public TeamChallengeController(TeamChallengeService teamChallengeService) {
        this.teamChallengeService = teamChallengeService;
    }

    // --- Teacher Selection Endpoints ---

    @GetMapping("/teacher/classes")
    @PreAuthorize("hasAnyAuthority('TEACHER','ROLE_TEACHER','SCHOOLADMIN','ROLE_SCHOOLADMIN','ADMIN','ROLE_ADMIN')")
    public List<Classroom> getTeacherClasses(@RequestParam(required = false) Long teacherId) {
        return teamChallengeService.getTeacherClasses(teacherId);
    }

    @GetMapping("/teacher/subjects")
    @PreAuthorize("hasAnyAuthority('TEACHER','ROLE_TEACHER','SCHOOLADMIN','ROLE_SCHOOLADMIN','ADMIN','ROLE_ADMIN')")
    public List<Subject> getSubjectsForClass(@RequestParam Long classId, @RequestParam(required = false) Long teacherId) {
        return teamChallengeService.getSubjectsForClass(classId, teacherId);
    }

    @GetMapping("/teacher/modules")
    @PreAuthorize("hasAnyAuthority('TEACHER','ROLE_TEACHER','SCHOOLADMIN','ROLE_SCHOOLADMIN','ADMIN','ROLE_ADMIN')")
    public List<String> getModulesForClassSubject(@RequestParam Long classSubjectId) {
        return teamChallengeService.getModulesForClassSubject(classSubjectId);
    }

    @GetMapping("/teacher/students")
    @PreAuthorize("hasAnyAuthority('TEACHER','ROLE_TEACHER','SCHOOLADMIN','ROLE_SCHOOLADMIN','ADMIN','ROLE_ADMIN')")
    public List<User> getClassroomStudents(@RequestParam Long classId) {
        return teamChallengeService.getClassroomStudents(classId);
    }

    // --- Challenge Creation & Fetching ---

    @PostMapping
    @PreAuthorize("hasAnyAuthority('TEACHER','ROLE_TEACHER','SCHOOLADMIN','ROLE_SCHOOLADMIN','ADMIN','ROLE_ADMIN')")
    public TeamChallengeDTO createChallenge(@RequestBody CreateTeamChallengeRequest request) {
        return teamChallengeService.createChallenge(request);
    }

    @GetMapping("/teacher/list")
    @PreAuthorize("hasAnyAuthority('TEACHER','ROLE_TEACHER','SCHOOLADMIN','ROLE_SCHOOLADMIN','ADMIN','ROLE_ADMIN')")
    public List<TeamChallengeDTO> getTeacherChallenges(@RequestParam Long teacherId) {
        return teamChallengeService.getTeacherChallenges(teacherId);
    }

    @GetMapping("/student/list")
    @PreAuthorize("hasAnyAuthority('STUDENT','ROLE_STUDENT','TEACHER','ROLE_TEACHER','SCHOOLADMIN','ROLE_SCHOOLADMIN')")
    public List<TeamChallengeDTO> getStudentChallenges(@RequestParam Long studentId) {
        return teamChallengeService.getStudentChallenges(studentId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('STUDENT','ROLE_STUDENT','TEACHER','ROLE_TEACHER','SCHOOLADMIN','ROLE_SCHOOLADMIN')")
    public TeamChallengeDTO getChallengeById(@PathVariable Long id) {
        return teamChallengeService.getChallengeById(id);
    }

    // --- Student Lobby & Session Endpoints ---

    @GetMapping("/{id}/lobby")
    @PreAuthorize("hasAnyAuthority('STUDENT','ROLE_STUDENT','TEACHER','ROLE_TEACHER')")
    public TeamLobbyStatusDTO getLobbyStatus(@PathVariable Long id, @RequestParam Long studentId) {
        return teamChallengeService.getLobbyStatus(id, studentId);
    }

    @PostMapping("/{id}/lobby/ready")
    @PreAuthorize("hasAnyAuthority('STUDENT','ROLE_STUDENT','TEACHER','ROLE_TEACHER')")
    public TeamLobbyStatusDTO toggleReady(@PathVariable Long id, @RequestParam Long studentId) {
        return teamChallengeService.toggleReady(id, studentId);
    }

    @GetMapping("/{id}/questions")
    @PreAuthorize("hasAnyAuthority('STUDENT','ROLE_STUDENT','TEACHER','ROLE_TEACHER')")
    public TeamSessionQuestionsResponseDTO getSessionQuestions(@PathVariable Long id, @RequestParam Long studentId) {
        return teamChallengeService.getSessionQuestions(id, studentId);
    }

    @PostMapping("/{id}/answer")
    @PreAuthorize("hasAnyAuthority('STUDENT','ROLE_STUDENT','TEACHER','ROLE_TEACHER')")
    public TeamSessionAnswerDTO selectAnswer(
            @PathVariable Long id,
            @RequestParam Long studentId,
            @RequestParam Integer questionNumber,
            @RequestParam String selectedOption) {
        return teamChallengeService.saveOrUpdateAnswer(id, studentId, questionNumber, selectedOption);
    }

    @GetMapping("/{id}/answers")
    @PreAuthorize("hasAnyAuthority('STUDENT','ROLE_STUDENT','TEACHER','ROLE_TEACHER')")
    public List<TeamSessionAnswerDTO> getSessionAnswers(@PathVariable Long id, @RequestParam Long studentId) {
        return teamChallengeService.getSessionAnswers(id, studentId);
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyAuthority('STUDENT','ROLE_STUDENT','TEACHER','ROLE_TEACHER')")
    public TeamChallengeResultDTO submitTeamChallenge(@PathVariable Long id, @RequestParam Long studentId) {
        return teamChallengeService.submitTeamChallenge(id, studentId);
    }
}
