package edu.example.edu.Repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.example.edu.Entity.SchoolCalendar;

@Repository
public interface SchoolCalendarRepository extends JpaRepository<SchoolCalendar, Long> {

    // Find all calendar entries for a school
    List<SchoolCalendar> findBySchool_SchoolId(Long schoolId);

    // Find entries for a specific date for a school (used to prevent duplicates)
    List<SchoolCalendar> findBySchool_SchoolIdAndDate(Long schoolId, LocalDate date);
}
