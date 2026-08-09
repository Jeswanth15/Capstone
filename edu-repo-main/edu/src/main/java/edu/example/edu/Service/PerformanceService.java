package edu.example.edu.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
public class PerformanceService {

    @Value("${python.service.url:http://localhost:8001}")
    private String pythonServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public Object getStudentPerformance(Long studentId) {
        String url = pythonServiceUrl + "/predict-performance/" + studentId;
        try {
            System.out.println(">>> Calling Python Service at: " + url);
            Object response = restTemplate.getForObject(url, Object.class);
            System.out.println(">>> Python Service Response: " + response);
            return response;
        } catch (Exception e) {
            System.err.println(">>> ERROR in PerformanceService: " + e.getMessage());
            e.printStackTrace();
            java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "Unable to fetch performance data: " + (e.getMessage() != null ? e.getMessage() : "Unknown error"));
            return errorResponse;
        }
    }
}
