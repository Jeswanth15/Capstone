package edu.example.edu.Service;

import edu.example.edu.Repository.SubstitutionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class SubstitutionCleaner {

    @Autowired
    private SubstitutionRepository substitutionRepository;

    /**
     * Runs every day at midnight to remove old substitutions.
     * Substitutions are only meant to be valid for their specific day.
     */
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void cleanOldSubstitutions() {
        LocalDate today = LocalDate.now();
        substitutionRepository.findAll().stream()
                .filter(s -> s.getDate().isBefore(today))
                .forEach(s -> substitutionRepository.delete(s));
        System.out.println("Old substitutions cleaned for " + today);
    }
}
