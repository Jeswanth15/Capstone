package edu.example.edu.Controller;

import edu.example.edu.DTO.ModuleTerritoryDTO;
import edu.example.edu.Service.ModuleCaptureService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/module-capture")
public class ModuleCaptureController {

    private final ModuleCaptureService moduleCaptureService;

    public ModuleCaptureController(ModuleCaptureService moduleCaptureService) {
        this.moduleCaptureService = moduleCaptureService;
    }

    @GetMapping("/subject/{subjectId}")
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public ResponseEntity<List<ModuleTerritoryDTO>> getSubjectModules(@PathVariable Long subjectId) {
        List<ModuleTerritoryDTO> list = moduleCaptureService.getModuleTerritoriesBySubject(subjectId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/territory")
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','SCHOOLADMIN','PRINCIPAL')")
    public ResponseEntity<ModuleTerritoryDTO> getModuleTerritory(
            @RequestParam Long subjectId,
            @RequestParam String moduleName
    ) {
        ModuleTerritoryDTO territory = moduleCaptureService.calculateModuleTerritory(subjectId, moduleName, null);
        return ResponseEntity.ok(territory);
    }
}
