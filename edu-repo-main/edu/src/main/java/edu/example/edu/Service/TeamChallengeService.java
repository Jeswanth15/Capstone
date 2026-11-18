package edu.example.edu.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.example.edu.DTO.*;
import edu.example.edu.Entity.*;
import edu.example.edu.Repository.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class TeamChallengeService {

    private final TeamChallengeRepository teamChallengeRepository;
    private final ChallengeTeamRepository challengeTeamRepository;
    private final ChallengeTeamMemberRepository challengeTeamMemberRepository;
    private final TeamSessionRepository teamSessionRepository;
    private final TeamSessionMemberRepository teamSessionMemberRepository;
    private final TeamSessionQuestionRepository teamSessionQuestionRepository;
    private final TeamSessionAnswerRepository teamSessionAnswerRepository;
    private final TeamChallengeResultRepository teamChallengeResultRepository;
    private final TeamStudentParticipationRepository teamStudentParticipationRepository;
    private final GamificationService gamificationService;
    private final ModuleCaptureService moduleCaptureService;
    private final ClassroomRepository classroomRepository;
    private final SubjectRepository subjectRepository;
    private final ClassSubjectRepository classSubjectRepository;
    private final SyllabusRepository syllabusRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final QuestionGenerationService questionGenerationService;
    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate;

    // Lock map to prevent duplicate Gemini calls for the same session ID
    private final ConcurrentHashMap<Long, Object> sessionLocks = new ConcurrentHashMap<>();

    public TeamChallengeService(
            TeamChallengeRepository teamChallengeRepository,
            ChallengeTeamRepository challengeTeamRepository,
            ChallengeTeamMemberRepository challengeTeamMemberRepository,
            TeamSessionRepository teamSessionRepository,
            TeamSessionMemberRepository teamSessionMemberRepository,
            TeamSessionQuestionRepository teamSessionQuestionRepository,
            TeamSessionAnswerRepository teamSessionAnswerRepository,
            TeamChallengeResultRepository teamChallengeResultRepository,
            TeamStudentParticipationRepository teamStudentParticipationRepository,
            GamificationService gamificationService,
            ModuleCaptureService moduleCaptureService,
            ClassroomRepository classroomRepository,
            SubjectRepository subjectRepository,
            ClassSubjectRepository classSubjectRepository,
            SyllabusRepository syllabusRepository,
            UserRepository userRepository,
            EnrollmentRepository enrollmentRepository,
            QuestionGenerationService questionGenerationService,
            ObjectMapper objectMapper,
            SimpMessagingTemplate messagingTemplate) {
        this.teamChallengeRepository = teamChallengeRepository;
        this.challengeTeamRepository = challengeTeamRepository;
        this.challengeTeamMemberRepository = challengeTeamMemberRepository;
        this.teamSessionRepository = teamSessionRepository;
        this.teamSessionMemberRepository = teamSessionMemberRepository;
        this.teamSessionQuestionRepository = teamSessionQuestionRepository;
        this.teamSessionAnswerRepository = teamSessionAnswerRepository;
        this.teamChallengeResultRepository = teamChallengeResultRepository;
        this.teamStudentParticipationRepository = teamStudentParticipationRepository;
        this.gamificationService = gamificationService;
        this.moduleCaptureService = moduleCaptureService;
        this.classroomRepository = classroomRepository;
        this.subjectRepository = subjectRepository;
        this.classSubjectRepository = classSubjectRepository;
        this.syllabusRepository = syllabusRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.questionGenerationService = questionGenerationService;
        this.objectMapper = objectMapper;
        this.messagingTemplate = messagingTemplate;
    }

    // --- Teacher Helper Endpoints ---

    public List<Classroom> getTeacherClasses(Long teacherId) {
        List<ClassSubject> classSubjects = classSubjectRepository.findAll();
        Set<Classroom> classrooms = new HashSet<>();
        for (ClassSubject cs : classSubjects) {
            if (cs.getTeacher() != null && cs.getTeacher().getUserId().equals(teacherId)) {
                classrooms.add(cs.getClassroom());
            }
        }
        if (classrooms.isEmpty()) {
            return classroomRepository.findAll();
        }
        return new ArrayList<>(classrooms);
    }

    public List<Subject> getSubjectsForClass(Long classId, Long teacherId) {
        List<ClassSubject> classSubjects = classSubjectRepository.findAll();
        Set<Subject> subjects = new HashSet<>();
        for (ClassSubject cs : classSubjects) {
            if (cs.getClassroom().getClassId().equals(classId)) {
                if (teacherId == null || cs.getTeacher() == null || cs.getTeacher().getUserId().equals(teacherId)) {
                    subjects.add(cs.getSubject());
                }
            }
        }
        if (subjects.isEmpty()) {
            for (ClassSubject cs : classSubjects) {
                if (cs.getClassroom().getClassId().equals(classId)) {
                    subjects.add(cs.getSubject());
                }
            }
        }
        if (subjects.isEmpty()) {
            return subjectRepository.findAll();
        }
        return new ArrayList<>(subjects);
    }

    public ClassSubject getClassSubject(Long classId, Long subjectId) {
        List<ClassSubject> list = classSubjectRepository.findAll();
        for (ClassSubject cs : list) {
            if (cs.getClassroom().getClassId().equals(classId) && cs.getSubject().getSubjectId().equals(subjectId)) {
                return cs;
            }
        }
        return null;
    }

    public List<String> getModulesForClassSubject(Long classSubjectId) {
        List<Syllabus> syllabusList = syllabusRepository.findByClassSubject_Id(classSubjectId);
        Set<String> modules = new LinkedHashSet<>();
        for (Syllabus s : syllabusList) {
            if (s.getModuleName() != null && !s.getModuleName().trim().isEmpty()) {
                modules.add(s.getModuleName().trim());
            }
        }
        if (modules.isEmpty()) {
            modules.add("Module 1 — Introduction");
            modules.add("Module 2 — Core Concepts");
            modules.add("Module 3 — Advanced Applications");
        }
        return new ArrayList<>(modules);
    }

    public List<User> getClassroomStudents(Long classId) {
        List<Enrollment> enrollments = enrollmentRepository.findAll();
        List<User> students = new ArrayList<>();
        for (Enrollment e : enrollments) {
            if (e.getClassroom().getClassId().equals(classId)) {
                students.add(e.getStudent());
            }
        }
        return students;
    }

    // --- Challenge Creation (Teacher) ---

    @Transactional
    public TeamChallengeDTO createChallenge(CreateTeamChallengeRequest req) {
        Classroom classroom = classroomRepository.findById(req.getClassId())
                .orElseThrow(() -> new RuntimeException("Classroom not found"));

        Subject subject = subjectRepository.findById(req.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        ClassSubject classSubject = null;
        if (req.getClassSubjectId() != null) {
            classSubject = classSubjectRepository.findById(req.getClassSubjectId()).orElse(null);
        }
        if (classSubject == null) {
            classSubject = getClassSubject(req.getClassId(), req.getSubjectId());
        }
        if (classSubject == null) {
            throw new RuntimeException("ClassSubject mapping not found for Class " + req.getClassId() + " and Subject " + req.getSubjectId());
        }

        User teacher = userRepository.findById(req.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        TeamChallenge challenge = new TeamChallenge();
        challenge.setTitle(req.getTitle() != null && !req.getTitle().trim().isEmpty() ? req.getTitle() : subject.getName() + " Team Challenge");
        challenge.setClassroom(classroom);
        challenge.setSubject(subject);
        challenge.setClassSubject(classSubject);
        challenge.setModuleName(req.getModuleName());
        challenge.setDifficulty(req.getDifficulty() != null ? req.getDifficulty().toUpperCase() : "MEDIUM");
        challenge.setChallengeDate(req.getChallengeDate());
        challenge.setStartTime(req.getStartTime());
        challenge.setEndTime(req.getEndTime());
        challenge.setDurationMinutes(req.getDurationMinutes() != null ? req.getDurationMinutes() : 15);
        challenge.setQuestionCount(10); // Strictly fixed at 10
        challenge.setMaxChatMessagesPerStudent(req.getMaxChatMessagesPerStudent() != null ? req.getMaxChatMessagesPerStudent() : 5);
        challenge.setCreatedBy(teacher);
        challenge.setCreatedAt(LocalDateTime.now());

        TeamChallenge savedChallenge = teamChallengeRepository.save(challenge);

        // Process Teams
        if (req.getTeams() != null && !req.getTeams().isEmpty()) {
            for (CreateTeamChallengeRequest.TeamConfig tc : req.getTeams()) {
                ChallengeTeam team = new ChallengeTeam();
                team.setChallenge(savedChallenge);
                team.setName(tc.getName() != null ? tc.getName() : "Team");
                ChallengeTeam savedTeam = challengeTeamRepository.save(team);

                if (tc.getStudentIds() != null) {
                    for (Long studentId : tc.getStudentIds()) {
                        User student = userRepository.findById(studentId).orElse(null);
                        if (student != null) {
                            ChallengeTeamMember member = new ChallengeTeamMember();
                            member.setTeam(savedTeam);
                            member.setStudent(student);
                            challengeTeamMemberRepository.save(member);
                        }
                    }
                }
            }
        }

        return convertToDTO(savedChallenge);
    }

    public List<TeamChallengeDTO> getTeacherChallenges(Long teacherId) {
        return teamChallengeRepository.findByCreatedBy_UserIdOrderByIdDesc(teacherId)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<TeamChallengeDTO> getStudentChallenges(Long studentId) {
        List<TeamChallenge> challenges = teamChallengeRepository.findChallengesByStudentId(studentId);
        List<TeamChallengeDTO> dtos = new ArrayList<>();
        for (TeamChallenge tc : challenges) {
            TeamChallengeDTO dto = convertToDTO(tc);
            Optional<ChallengeTeam> teamOpt = challengeTeamRepository.findByChallenge_IdAndMembers_Student_UserId(tc.getId(), studentId);
            if (teamOpt.isPresent()) {
                Optional<TeamSession> sessionOpt = teamSessionRepository.findByChallenge_IdAndTeam_Id(tc.getId(), teamOpt.get().getId());
                if (sessionOpt.isPresent()) {
                    dto.setSessionStatus(sessionOpt.get().getStatus());
                } else {
                    dto.setSessionStatus("NOT_STARTED");
                }
            }
            dtos.add(dto);
        }
        return dtos;
    }

    public TeamChallengeDTO getChallengeById(Long challengeId) {
        TeamChallenge tc = teamChallengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));
        return convertToDTO(tc);
    }

    // --- Student Lobby & Majority Start ---

    @Transactional
    public TeamLobbyStatusDTO getLobbyStatus(Long challengeId, Long studentId) {
        TeamChallenge challenge = teamChallengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        ChallengeTeam team = challengeTeamRepository.findByChallenge_IdAndMembers_Student_UserId(challengeId, studentId)
                .orElseThrow(() -> new RuntimeException("Student is not assigned to any team in this challenge"));

        TeamSession session = teamSessionRepository.findByChallenge_IdAndTeam_Id(challengeId, team.getId())
                .orElseGet(() -> {
                    TeamSession newSession = new TeamSession();
                    newSession.setChallenge(challenge);
                    newSession.setTeam(team);
                    newSession.setStatus("WAITING");
                    newSession.setGenerationStatus("NOT_STARTED");
                    return teamSessionRepository.save(newSession);
                });

        return buildLobbyDTO(challenge, team, session, studentId);
    }

    @Transactional
    public TeamLobbyStatusDTO toggleReady(Long challengeId, Long studentId) {
        TeamChallenge challenge = teamChallengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        ChallengeTeam team = challengeTeamRepository.findByChallenge_IdAndMembers_Student_UserId(challengeId, studentId)
                .orElseThrow(() -> new RuntimeException("Student is not assigned to any team in this challenge"));

        TeamSession session = teamSessionRepository.findByChallenge_IdAndTeam_Id(challengeId, team.getId())
                .orElseGet(() -> {
                    TeamSession newSession = new TeamSession();
                    newSession.setChallenge(challenge);
                    newSession.setTeam(team);
                    newSession.setStatus("WAITING");
                    newSession.setGenerationStatus("NOT_STARTED");
                    return teamSessionRepository.save(newSession);
                });

        if ("COMPLETED".equals(session.getStatus())) {
            throw new RuntimeException("This team challenge has already been completed and submitted. No second attempts are allowed.");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Toggle ready for current student
        Optional<TeamSessionMember> memberOpt = teamSessionMemberRepository.findBySession_IdAndStudent_UserId(session.getId(), studentId);
        if (memberOpt.isPresent()) {
            TeamSessionMember m = memberOpt.get();
            if ("READY".equals(m.getStatus())) {
                m.setStatus("WAITING");
            } else {
                m.setStatus("READY");
            }
            teamSessionMemberRepository.save(m);
        } else {
            TeamSessionMember m = new TeamSessionMember();
            m.setSession(session);
            m.setStudent(student);
            m.setStatus("READY");
            m.setJoinedAt(LocalDateTime.now());
            teamSessionMemberRepository.save(m);
        }

        // Evaluate Majority Condition
        List<TeamSessionMember> sessionMembers = teamSessionMemberRepository.findBySession_Id(session.getId());
        long readyCount = sessionMembers.stream().filter(m -> "READY".equals(m.getStatus())).count();
        List<ChallengeTeamMember> totalTeamMembers = challengeTeamMemberRepository.findByTeam_Id(team.getId());
        int teamSize = totalTeamMembers.size();
        int majorityThreshold = (teamSize / 2) + 1;

        if (readyCount >= majorityThreshold && "WAITING".equals(session.getStatus())) {
            // Majority reached! Mark session as ACTIVE
            session.setStatus("ACTIVE");
            session.setStartedAt(LocalDateTime.now());
            
            // Mark non-ready members as ABSENT
            Set<Long> readyStudentIds = sessionMembers.stream()
                    .filter(m -> "READY".equals(m.getStatus()))
                    .map(m -> m.getStudent().getUserId())
                    .collect(Collectors.toSet());

            for (ChallengeTeamMember ctm : totalTeamMembers) {
                if (!readyStudentIds.contains(ctm.getStudent().getUserId())) {
                    Optional<TeamSessionMember> absentOpt = teamSessionMemberRepository
                            .findBySession_IdAndStudent_UserId(session.getId(), ctm.getStudent().getUserId());
                    TeamSessionMember absentMember = absentOpt.orElseGet(() -> {
                        TeamSessionMember newM = new TeamSessionMember();
                        newM.setSession(session);
                        newM.setStudent(ctm.getStudent());
                        return newM;
                    });
                    absentMember.setStatus("ABSENT");
                    teamSessionMemberRepository.save(absentMember);
                }
            }

            teamSessionRepository.save(session);

            // Trigger On-Demand Gemini Question Generation strictly once
            triggerQuestionGeneration(session);
        }

        return buildLobbyDTO(challenge, team, session, studentId);
    }

    // --- On-Demand Synchronized Gemini Question Generation ---

    public void triggerQuestionGeneration(TeamSession session) {
        Object lock = sessionLocks.computeIfAbsent(session.getId(), k -> new Object());
        synchronized (lock) {
            // Re-fetch session state inside synchronized block
            TeamSession currentSession = teamSessionRepository.findById(session.getId()).orElse(session);
            if ("GENERATED".equals(currentSession.getGenerationStatus()) || "GENERATING".equals(currentSession.getGenerationStatus())) {
                return; // Already generating or generated by another thread!
            }

            currentSession.setGenerationStatus("GENERATING");
            teamSessionRepository.save(currentSession);

            try {
                QuestionGenerationRequest req = new QuestionGenerationRequest();
                req.setModuleName(currentSession.getChallenge().getModuleName());
                req.setClassSubjectId(String.valueOf(currentSession.getChallenge().getClassSubject().getId()));
                req.setDifficulty(currentSession.getChallenge().getDifficulty());
                req.setTeamSessionId(String.valueOf(currentSession.getId()));
                req.setSeed(String.valueOf(currentSession.getId() * 31L + System.currentTimeMillis()));

                List<Question> generatedQuestions = questionGenerationService.generateQuestions(req);

                if (generatedQuestions == null || generatedQuestions.isEmpty()) {
                    throw new RuntimeException("Question generation returned empty list");
                }

                // Save generated questions to TeamSessionQuestion table
                int qNum = 1;
                for (Question q : generatedQuestions) {
                    TeamSessionQuestion sq = new TeamSessionQuestion();
                    sq.setSession(currentSession);
                    sq.setQuestionNumber(qNum++);
                    sq.setQuestionText(q.getQuestionText() != null ? q.getQuestionText() : "");
                    sq.setOptionsJson(objectMapper.writeValueAsString(q.getOptions() != null ? q.getOptions() : Collections.emptyList()));
                    sq.setCorrectOption(q.getCorrectOption() != null ? q.getCorrectOption() : "");
                    sq.setExplanation(q.getExplanation());
                    sq.setDifficulty(q.getDifficulty());
                    sq.setModuleName(currentSession.getChallenge().getModuleName());
                    teamSessionQuestionRepository.save(sq);
                }

                currentSession.setGenerationStatus("GENERATED");
                currentSession.setGeneratedAt(LocalDateTime.now());
                teamSessionRepository.save(currentSession);

            } catch (Exception e) {
                System.err.println("Error generating questions for TeamSession " + session.getId() + ": " + e.getMessage());
                currentSession.setGenerationStatus("FAILED");
                teamSessionRepository.save(currentSession);
            }
        }
    }

    // --- Fetch Generated Questions for Team Members ---

    public TeamSessionQuestionsResponseDTO getSessionQuestions(Long challengeId, Long studentId) {
        TeamChallenge challenge = teamChallengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        ChallengeTeam team = challengeTeamRepository.findByChallenge_IdAndMembers_Student_UserId(challengeId, studentId)
                .orElseThrow(() -> new RuntimeException("Student is not assigned to any team in this challenge"));

        TeamSession session = teamSessionRepository.findByChallenge_IdAndTeam_Id(challengeId, team.getId())
                .orElseThrow(() -> new RuntimeException("Team session has not been initialized"));

        // If generation is in progress, poll/wait up to 5 seconds
        if ("GENERATING".equals(session.getGenerationStatus())) {
            for (int i = 0; i < 10; i++) {
                try { Thread.sleep(500); } catch (InterruptedException ignored) {}
                session = teamSessionRepository.findById(session.getId()).orElse(session);
                if (!"GENERATING".equals(session.getGenerationStatus())) {
                    break;
                }
            }
        }

        // If not started yet but session is ACTIVE, attempt generation
        if ("NOT_STARTED".equals(session.getGenerationStatus()) && "ACTIVE".equals(session.getStatus())) {
            triggerQuestionGeneration(session);
            session = teamSessionRepository.findById(session.getId()).orElse(session);
        }

        List<TeamSessionQuestion> questions = teamSessionQuestionRepository.findBySession_IdOrderByQuestionNumberAsc(session.getId());

        List<TeamSessionQuestionsResponseDTO.QuestionItemDTO> items = new ArrayList<>();
        for (TeamSessionQuestion q : questions) {
            List<String> options = Collections.emptyList();
            try {
                if (q.getOptionsJson() != null) {
                    options = objectMapper.readValue(q.getOptionsJson(), new TypeReference<List<String>>() {});
                }
            } catch (Exception ignored) {}

            items.add(new TeamSessionQuestionsResponseDTO.QuestionItemDTO(
                    q.getId(),
                    q.getQuestionNumber(),
                    q.getQuestionText(),
                    options,
                    q.getCorrectOption(),
                    q.getExplanation(),
                    q.getDifficulty(),
                    q.getModuleName()
            ));
        }

        return new TeamSessionQuestionsResponseDTO(
                session.getId(),
                challenge.getId(),
                team.getId(),
                team.getName(),
                session.getStatus(),
                session.getGenerationStatus(),
                session.getSubmittedByName(),
                challenge.getDurationMinutes(),
                items
        );
    }

    @Transactional
    public TeamChallengeResultDTO submitTeamChallenge(Long challengeId, Long studentId) {
        TeamChallenge challenge = teamChallengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        ChallengeTeam team = challengeTeamRepository.findByChallenge_IdAndMembers_Student_UserId(challengeId, studentId)
                .orElseThrow(() -> new RuntimeException("Student is not assigned to any team in this challenge"));

        TeamSession session = teamSessionRepository.findByChallenge_IdAndTeam_Id(challengeId, team.getId())
                .orElseThrow(() -> new RuntimeException("Team session has not been initialized"));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (!"COMPLETED".equals(session.getStatus())) {
            session.setStatus("COMPLETED");
            session.setEndedAt(LocalDateTime.now());
            session.setSubmittedBy(student);
            session.setSubmittedByName(student.getName() != null && !student.getName().trim().isEmpty() ? student.getName() : student.getEmail());
            teamSessionRepository.save(session);

            // Broadcast real-time submission to STOMP WebSocket topic
            try {
                Map<String, Object> payload = new HashMap<>();
                payload.put("sessionId", session.getId());
                payload.put("challengeId", challenge.getId());
                payload.put("status", "COMPLETED");
                payload.put("submittedByStudentId", student.getUserId());
                payload.put("submittedByStudentName", session.getSubmittedByName());
                payload.put("submittedAt", session.getEndedAt() != null ? session.getEndedAt().toString() : LocalDateTime.now().toString());

                messagingTemplate.convertAndSend("/topic/team-session/" + session.getId() + "/submit", payload);
            } catch (Exception e) {
                System.err.println("Failed to broadcast team submission via WebSocket: " + e.getMessage());
            }
        }

        return evaluateAndSaveSessionResult(session, challenge, team, student);
    }

    @Transactional
    public TeamChallengeResultDTO evaluateAndSaveSessionResult(TeamSession session, TeamChallenge challenge, ChallengeTeam team, User student) {
        // Idempotency check: Return existing result if evaluated previously
        Optional<TeamChallengeResult> existingOpt = teamChallengeResultRepository.findBySession_Id(session.getId());

        TeamChallengeResult result;
        if (existingOpt.isPresent()) {
            result = existingOpt.get();
        } else {
            // 1. Fetch questions and answers
            List<TeamSessionQuestion> questions = teamSessionQuestionRepository.findBySession_IdOrderByQuestionNumberAsc(session.getId());
            List<TeamSessionAnswer> answers = teamSessionAnswerRepository.findBySession_Id(session.getId());

            Map<Integer, TeamSessionAnswer> answerMap = new HashMap<>();
            for (TeamSessionAnswer ans : answers) {
                answerMap.put(ans.getQuestionNumber(), ans);
            }

            int correctCount = 0;
            int incorrectCount = 0;

            for (TeamSessionQuestion q : questions) {
                TeamSessionAnswer userAns = answerMap.get(q.getQuestionNumber());
                if (userAns != null && q.getCorrectOption() != null &&
                    userAns.getSelectedOption() != null &&
                    userAns.getSelectedOption().trim().equalsIgnoreCase(q.getCorrectOption().trim())) {
                    correctCount++;
                } else {
                    incorrectCount++;
                }
            }

            int totalQuestions = questions.size() > 0 ? questions.size() : 10;
            int score = correctCount * 10; // 10 points per correct question, max 100
            double percentage = (correctCount / (double) totalQuestions) * 100.0;

            // 2. Fetch current module leader BEFORE saving
            String moduleName = challenge.getModuleName() != null ? challenge.getModuleName() : "General Module";
            Long subjectId = challenge.getSubject().getSubjectId();

            ModuleTerritoryDTO prevTerritory = moduleCaptureService.calculateModuleTerritory(subjectId, moduleName, null);
            String previousLeader = prevTerritory.getControllingTeamName();

            // 3. Save TeamChallengeResult
            result = new TeamChallengeResult();
            result.setSession(session);
            result.setChallenge(challenge);
            result.setTeam(team);
            result.setSubject(challenge.getSubject());
            result.setModuleName(moduleName);
            result.setTotalQuestions(totalQuestions);
            result.setCorrectAnswers(correctCount);
            result.setIncorrectAnswers(incorrectCount);
            result.setScore(score);
            result.setPercentage(percentage);
            result.setSubmittedAt(LocalDateTime.now());
            result.setXpAwardedPerMember(gamificationService.calculateXpForChallenge(score, false));

            result = teamChallengeResultRepository.save(result);

            // 4. Calculate updated territory AFTER saving
            ModuleTerritoryDTO newTerritory = moduleCaptureService.calculateModuleTerritory(subjectId, moduleName, null);
            String newLeader = newTerritory.getControllingTeamName();

            boolean capturedNow = !Objects.equals(previousLeader, newLeader) && 
                                  newTerritory.getControllingTeamId() != null && 
                                  newTerritory.getControllingTeamId().equals(team.getId());

            result.setIsModuleCaptured(capturedNow);
            result.setPreviousModuleLeader(previousLeader);
            result = teamChallengeResultRepository.save(result);

            // 5. Participation tracking
            List<TeamSessionMember> sessionMembers = teamSessionMemberRepository.findBySession_Id(session.getId());
            for (TeamSessionMember sm : sessionMembers) {
                Optional<TeamStudentParticipation> partOpt = teamStudentParticipationRepository.findBySession_IdAndStudent_UserId(session.getId(), sm.getStudent().getUserId());
                TeamStudentParticipation part = partOpt.orElseGet(() -> {
                    TeamStudentParticipation p = new TeamStudentParticipation();
                    p.setSession(session);
                    p.setStudent(sm.getStudent());
                    return p;
                });
                boolean isReady = "READY".equals(sm.getStatus());
                part.setJoined(true);
                part.setIsActive(isReady);
                part.setParticipated(isReady);
                part.setCompletionStatus(isReady ? "COMPLETED" : "ABSENT");
                teamStudentParticipationRepository.save(part);
            }

            // 6. Award XP and evaluate Badges for active members
            boolean isWinningTeam = newTerritory.getControllingTeamId() != null && newTerritory.getControllingTeamId().equals(team.getId());
            for (TeamSessionMember sm : sessionMembers) {
                if ("READY".equals(sm.getStatus())) {
                    gamificationService.awardXpAndEvaluateBadges(sm.getStudent(), result, isWinningTeam);
                }
            }
        }

        // Build Question Evaluations list
        List<TeamSessionQuestion> questions = teamSessionQuestionRepository.findBySession_IdOrderByQuestionNumberAsc(session.getId());
        List<TeamSessionAnswer> answers = teamSessionAnswerRepository.findBySession_Id(session.getId());
        Map<Integer, TeamSessionAnswer> answerMap = new HashMap<>();
        for (TeamSessionAnswer ans : answers) {
            answerMap.put(ans.getQuestionNumber(), ans);
        }

        List<TeamChallengeResultDTO.QuestionEvaluationDTO> questionEvals = new ArrayList<>();
        for (TeamSessionQuestion q : questions) {
            TeamSessionAnswer userAns = answerMap.get(q.getQuestionNumber());
            String sel = userAns != null ? userAns.getSelectedOption() : null;
            boolean isCorrect = sel != null && q.getCorrectOption() != null && sel.trim().equalsIgnoreCase(q.getCorrectOption().trim());

            questionEvals.add(new TeamChallengeResultDTO.QuestionEvaluationDTO(
                    q.getQuestionNumber(),
                    sel,
                    q.getCorrectOption(),
                    isCorrect,
                    isCorrect ? 10 : 0,
                    userAns != null ? userAns.getSelectedByName() : null
            ));
        }

        UserGamificationProfileDTO userProfile = gamificationService.getUserProfile(student.getUserId());
        ModuleTerritoryDTO currentTerritory = moduleCaptureService.calculateModuleTerritory(challenge.getSubject().getSubjectId(), challenge.getModuleName(), null);

        int teamRank = 1;
        for (ModuleTerritoryDTO.CompetingTeamScoreDTO ct : currentTerritory.getCompetingTeams()) {
            if (ct.getTeamId().equals(team.getId())) {
                teamRank = ct.getRank();
                break;
            }
        }

        return new TeamChallengeResultDTO(
                session.getId(),
                challenge.getId(),
                challenge.getTitle(),
                team.getId(),
                team.getName(),
                challenge.getSubject().getSubjectId(),
                challenge.getSubject().getName(),
                challenge.getModuleName(),
                result.getTotalQuestions(),
                result.getCorrectAnswers(),
                result.getIncorrectAnswers(),
                result.getScore(),
                result.getPercentage(),
                result.getXpAwardedPerMember(),
                userProfile.getTotalXp(),
                userProfile.getCurrentLevel(),
                userProfile.getXpRequiredForNextLevel(),
                userProfile.getLevelProgressPercentage(),
                currentTerritory.getControllingTeamName(),
                currentTerritory.getControllingTeamId(),
                currentTerritory.getControllingTeamPoints(),
                teamRank,
                result.getIsModuleCaptured(),
                result.getPreviousModuleLeader(),
                questionEvals,
                userProfile.getBadges()
        );
    }

    // --- Private DTO Converter Helpers ---

    private TeamLobbyStatusDTO buildLobbyDTO(TeamChallenge challenge, ChallengeTeam team, TeamSession session, Long currentStudentId) {
        List<ChallengeTeamMember> teamMembers = challengeTeamMemberRepository.findByTeam_Id(team.getId());
        List<TeamSessionMember> sessionMembers = teamSessionMemberRepository.findBySession_Id(session.getId());

        Map<Long, String> memberStatusMap = new HashMap<>();
        for (TeamSessionMember sm : sessionMembers) {
            memberStatusMap.put(sm.getStudent().getUserId(), sm.getStatus());
        }

        List<TeamLobbyStatusDTO.MemberLobbyStatus> memberList = new ArrayList<>();
        int readyCount = 0;
        boolean currentUserIsReady = false;
        String currentUserStatus = "WAITING";

        for (ChallengeTeamMember ctm : teamMembers) {
            User s = ctm.getStudent();
            String status = memberStatusMap.getOrDefault(s.getUserId(), "WAITING");
            boolean isReady = "READY".equals(status);
            if (isReady) readyCount++;

            if (s.getUserId().equals(currentStudentId)) {
                currentUserIsReady = isReady;
                currentUserStatus = status;
            }

            memberList.add(new TeamLobbyStatusDTO.MemberLobbyStatus(
                    s.getUserId(),
                    s.getName(),
                    s.getEmail(),
                    isReady,
                    status
            ));
        }

        int totalMembers = teamMembers.size();
        int majorityThreshold = (totalMembers / 2) + 1;
        boolean majorityReached = readyCount >= majorityThreshold;

        return new TeamLobbyStatusDTO(
                challenge.getId(),
                challenge.getTitle(),
                challenge.getSubject().getName(),
                challenge.getModuleName(),
                challenge.getDifficulty(),
                challenge.getChallengeDate().toString(),
                challenge.getStartTime().toString(),
                challenge.getEndTime().toString(),
                challenge.getDurationMinutes(),
                challenge.getQuestionCount(),
                team.getId(),
                team.getName(),
                totalMembers,
                readyCount,
                majorityThreshold,
                majorityReached,
                session.getId(),
                session.getStatus(),
                session.getGenerationStatus(),
                currentUserIsReady,
                currentUserStatus,
                memberList
        );
    }

    private TeamChallengeDTO convertToDTO(TeamChallenge tc) {
        List<ChallengeTeam> teams = challengeTeamRepository.findByChallenge_Id(tc.getId());
        List<TeamChallengeDTO.TeamDTO> teamDTOs = new ArrayList<>();

        for (ChallengeTeam team : teams) {
            List<ChallengeTeamMember> members = challengeTeamMemberRepository.findByTeam_Id(team.getId());
            List<TeamChallengeDTO.StudentDTO> studentDTOs = members.stream()
                    .map(m -> new TeamChallengeDTO.StudentDTO(m.getStudent().getUserId(), m.getStudent().getName(), m.getStudent().getEmail()))
                    .collect(Collectors.toList());

            teamDTOs.add(new TeamChallengeDTO.TeamDTO(team.getId(), team.getName(), studentDTOs));
        }

        TeamChallengeDTO dto = new TeamChallengeDTO();
        dto.setId(tc.getId());
        dto.setTitle(tc.getTitle());
        if (tc.getClassroom() != null) {
            dto.setClassId(tc.getClassroom().getClassId());
            dto.setClassName(tc.getClassroom().getName());
            dto.setClassSection(tc.getClassroom().getSection());
        }
        if (tc.getSubject() != null) {
            dto.setSubjectId(tc.getSubject().getSubjectId());
            dto.setSubjectName(tc.getSubject().getName());
        }
        if (tc.getClassSubject() != null) {
            dto.setClassSubjectId(tc.getClassSubject().getId());
        }
        dto.setModuleName(tc.getModuleName());
        dto.setDifficulty(tc.getDifficulty());
        dto.setChallengeDate(tc.getChallengeDate());
        dto.setStartTime(tc.getStartTime());
        dto.setEndTime(tc.getEndTime());
        dto.setDurationMinutes(tc.getDurationMinutes());
        dto.setQuestionCount(tc.getQuestionCount());
        dto.setMaxChatMessagesPerStudent(tc.getMaxChatMessagesPerStudent());
        if (tc.getCreatedBy() != null) {
            dto.setTeacherId(tc.getCreatedBy().getUserId());
            dto.setTeacherName(tc.getCreatedBy().getName());
        }
        dto.setCreatedAt(tc.getCreatedAt());
        dto.setTeams(teamDTOs);
        return dto;
    }

    // --- Real-time Team Session Answer Methods ---

    @Transactional
    public TeamSessionAnswerDTO saveOrUpdateAnswer(Long challengeId, Long studentId, Integer questionNumber, String selectedOption) {
        TeamChallenge challenge = teamChallengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        ChallengeTeam team = challengeTeamRepository.findByChallenge_IdAndMembers_Student_UserId(challengeId, studentId)
                .orElseThrow(() -> new RuntimeException("Student is not assigned to any team in this challenge"));

        TeamSession session = teamSessionRepository.findByChallenge_IdAndTeam_Id(challengeId, team.getId())
                .orElseThrow(() -> new RuntimeException("Team session has not been initialized"));

        if ("COMPLETED".equals(session.getStatus())) {
            throw new RuntimeException("This team challenge has already been completed and submitted. Answers cannot be modified.");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Optional<TeamSessionAnswer> existingOpt = teamSessionAnswerRepository.findBySession_IdAndQuestionNumber(session.getId(), questionNumber);

        TeamSessionAnswer answer = existingOpt.orElseGet(() -> {
            TeamSessionAnswer newAns = new TeamSessionAnswer();
            newAns.setSession(session);
            newAns.setQuestionNumber(questionNumber);
            return newAns;
        });

        answer.setSelectedOption(selectedOption);
        answer.setSelectedBy(student);
        answer.setSelectedByName(student.getName() != null && !student.getName().trim().isEmpty() ? student.getName() : student.getEmail());
        answer.setUpdatedAt(LocalDateTime.now());

        TeamSessionAnswer saved = teamSessionAnswerRepository.save(answer);

        TeamSessionAnswerDTO dto = new TeamSessionAnswerDTO(
                session.getId(),
                saved.getQuestionNumber(),
                saved.getSelectedOption(),
                student.getUserId(),
                saved.getSelectedByName(),
                saved.getUpdatedAt() != null ? saved.getUpdatedAt().toString() : LocalDateTime.now().toString()
        );

        // Broadcast to all active team members listening on topic
        try {
            messagingTemplate.convertAndSend("/topic/team-session/" + session.getId() + "/answer", dto);
        } catch (Exception e) {
            System.err.println("Failed to broadcast team answer via WebSocket: " + e.getMessage());
        }

        return dto;
    }

    public List<TeamSessionAnswerDTO> getSessionAnswers(Long challengeId, Long studentId) {
        TeamChallenge challenge = teamChallengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        ChallengeTeam team = challengeTeamRepository.findByChallenge_IdAndMembers_Student_UserId(challengeId, studentId)
                .orElseThrow(() -> new RuntimeException("Student is not assigned to any team in this challenge"));

        TeamSession session = teamSessionRepository.findByChallenge_IdAndTeam_Id(challengeId, team.getId())
                .orElseThrow(() -> new RuntimeException("Team session has not been initialized"));

        List<TeamSessionAnswer> list = teamSessionAnswerRepository.findBySession_Id(session.getId());

        List<TeamSessionAnswerDTO> dtos = new ArrayList<>();
        for (TeamSessionAnswer a : list) {
            dtos.add(new TeamSessionAnswerDTO(
                    session.getId(),
                    a.getQuestionNumber(),
                    a.getSelectedOption(),
                    a.getSelectedBy().getUserId(),
                    a.getSelectedByName(),
                    a.getUpdatedAt() != null ? a.getUpdatedAt().toString() : ""
            ));
        }
        return dtos;
    }
}
