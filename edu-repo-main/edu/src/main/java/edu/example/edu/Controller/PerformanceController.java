package edu.example.edu.Controller;

import edu.example.edu.Service.PerformanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/performance")
public class PerformanceController {

    @Autowired
    private PerformanceService performanceService;

    @GetMapping("/student/{studentId}")
    public ResponseEntity<Object> getStudentPerformance(@PathVariable Long studentId) {
        try {
            System.out.println(">>> Performance request for student ID: " + studentId);
            Object result = performanceService.getStudentPerformance(studentId);
            System.out.println(">>> Performance result success");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("!!! PERFORMANCE CONTROLLER ERROR: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Controller Error",
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error",
                "type", e.getClass().getName()
            ));
        }
    }
}
