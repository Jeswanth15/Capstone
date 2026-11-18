package edu.example.edu.Service;

import edu.example.edu.DTO.ModuleTerritoryDTO;
import edu.example.edu.Entity.Syllabus;
import edu.example.edu.Entity.TeamChallengeResult;
import edu.example.edu.Repository.SyllabusRepository;
import edu.example.edu.Repository.TeamChallengeResultRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ModuleCaptureService {

    private final TeamChallengeResultRepository resultRepository;
    private final SyllabusRepository syllabusRepository;

    public ModuleCaptureService(
            TeamChallengeResultRepository resultRepository,
            SyllabusRepository syllabusRepository
    ) {
        this.resultRepository = resultRepository;
        this.syllabusRepository = syllabusRepository;
    }

    public List<ModuleTerritoryDTO> getModuleTerritoriesBySubject(Long subjectId) {
        // Collect all unique module names for the subject from results and syllabus entries
        Set<String> moduleNames = new LinkedHashSet<>();
        
        List<Syllabus> syllabusList = syllabusRepository.findAll();
        for (Syllabus s : syllabusList) {
            if (s.getClassSubject() != null && 
                s.getClassSubject().getSubject() != null && 
                Objects.equals(s.getClassSubject().getSubject().getSubjectId(), subjectId) &&
                s.getModuleName() != null && !s.getModuleName().trim().isEmpty()) {
                moduleNames.add(s.getModuleName().trim());
            }
        }

        List<TeamChallengeResult> results = resultRepository.findBySubject_SubjectId(subjectId);
        for (TeamChallengeResult r : results) {
            if (r.getModuleName() != null && !r.getModuleName().trim().isEmpty()) {
                moduleNames.add(r.getModuleName().trim());
            }
        }

        // If no modules registered yet, default fallback module names for standard subjects
        if (moduleNames.isEmpty()) {
            moduleNames.addAll(Arrays.asList("Arrays", "Linked List", "Stack & Queue", "Trees", "Graphs"));
        }

        List<ModuleTerritoryDTO> territories = new ArrayList<>();
        for (String modName : moduleNames) {
            territories.add(calculateModuleTerritory(subjectId, modName, results));
        }

        return territories;
    }

    public ModuleTerritoryDTO calculateModuleTerritory(Long subjectId, String moduleName, List<TeamChallengeResult> allResults) {
        List<TeamChallengeResult> modResults = (allResults != null ? allResults : resultRepository.findBySubject_SubjectIdAndModuleName(subjectId, moduleName))
                .stream()
                .filter(r -> Objects.equals(r.getModuleName(), moduleName) || (r.getModuleName() != null && r.getModuleName().equalsIgnoreCase(moduleName)))
                .collect(Collectors.toList());

        // Group points by team
        Map<Long, String> teamNameMap = new HashMap<>();
        Map<Long, Integer> teamPointsMap = new HashMap<>();
        Map<Long, Integer> teamCountMap = new HashMap<>();

        for (TeamChallengeResult r : modResults) {
            Long teamId = r.getTeam().getId();
            String teamName = r.getTeam().getName() != null ? r.getTeam().getName() : "Team #" + teamId;
            
            teamNameMap.put(teamId, teamName);
            teamPointsMap.put(teamId, teamPointsMap.getOrDefault(teamId, 0) + (r.getScore() != null ? r.getScore() : 0));
            teamCountMap.put(teamId, teamCountMap.getOrDefault(teamId, 0) + 1);
        }

        List<ModuleTerritoryDTO.CompetingTeamScoreDTO> competingList = new ArrayList<>();
        for (Map.Entry<Long, Integer> entry : teamPointsMap.entrySet()) {
            Long tid = entry.getKey();
            competingList.add(new ModuleTerritoryDTO.CompetingTeamScoreDTO(
                    tid,
                    teamNameMap.get(tid),
                    entry.getValue(),
                    teamCountMap.get(tid),
                    0,
                    false
            ));
        }

        // Sort teams descending by points (tie-breaker: total challenges played desc, then teamId asc)
        competingList.sort((a, b) -> {
            int cmp = Integer.compare(b.getAccumulatedPoints(), a.getAccumulatedPoints());
            if (cmp != 0) return cmp;
            int countCmp = Integer.compare(b.getChallengesPlayed(), a.getChallengesPlayed());
            if (countCmp != 0) return countCmp;
            return Long.compare(a.getTeamId(), b.getTeamId());
        });

        // Set ranks
        for (int i = 0; i < competingList.size(); i++) {
            competingList.get(i).setRank(i + 1);
        }

        String leaderName = "UNCLAIMED";
        Long leaderId = null;
        Integer leaderPoints = 0;

        if (!competingList.isEmpty()) {
            ModuleTerritoryDTO.CompetingTeamScoreDTO leader = competingList.get(0);
            leader.setIsLeader(true);
            leaderName = leader.getTeamName();
            leaderId = leader.getTeamId();
            leaderPoints = leader.getAccumulatedPoints();
        }

        String subjectName = modResults.isEmpty() ? "Subject #" + subjectId : modResults.get(0).getSubject().getName();

        return new ModuleTerritoryDTO(
                moduleName,
                subjectId,
                subjectName,
                leaderName,
                leaderId,
                leaderPoints,
                modResults.size(),
                competingList
        );
    }
}
