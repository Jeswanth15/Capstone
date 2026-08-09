package edu.example.edu.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.example.edu.Entity.Enrollment;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
}
