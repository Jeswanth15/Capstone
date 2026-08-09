package edu.example.edu.Repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.example.edu.Entity.Substitution;
import edu.example.edu.Entity.User;

@Repository
public interface SubstitutionRepository extends JpaRepository<Substitution, Long> {
    List<Substitution> findByDate(LocalDate date);
    List<Substitution> findBySubstituteTeacher(User teacher);
}
