package edu.example.edu.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.example.edu.Entity.Subject;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
}
