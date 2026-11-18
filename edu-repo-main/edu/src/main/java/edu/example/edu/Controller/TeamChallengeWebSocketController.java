package edu.example.edu.Controller;

import edu.example.edu.DTO.TeamSessionAnswerDTO;
import edu.example.edu.Service.TeamChallengeService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Controller
public class TeamChallengeWebSocketController {

    private final TeamChallengeService teamChallengeService;

    public TeamChallengeWebSocketController(TeamChallengeService teamChallengeService) {
        this.teamChallengeService = teamChallengeService;
    }

    @MessageMapping("/team-session/{challengeId}/select-answer")
    public void handleAnswerSelection(@DestinationVariable Long challengeId, @Payload TeamSessionAnswerDTO message) {
        if (challengeId != null && message.getStudentId() != null && message.getQuestionNumber() != null && message.getSelectedOption() != null) {
            teamChallengeService.saveOrUpdateAnswer(challengeId, message.getStudentId(), message.getQuestionNumber(), message.getSelectedOption());
        }
    }

    @MessageMapping("/team-session/{challengeId}/submit")
    public void handleTeamSubmit(@DestinationVariable Long challengeId, @Payload java.util.Map<String, Object> payload) {
        if (challengeId != null && payload.get("studentId") != null) {
            Long studentId = Long.valueOf(payload.get("studentId").toString());
            teamChallengeService.submitTeamChallenge(challengeId, studentId);
        }
    }
}
