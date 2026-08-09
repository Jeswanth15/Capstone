// package edu.example.edu.Repository;

// import java.util.List;

// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.stereotype.Repository;

// import edu.example.edu.Entity.Timetable;

// @Repository
// public interface TimetableRepository extends JpaRepository<Timetable, Long> {
//     List<Timetable> findByClassroom_ClassId(Long classId);

// }
package edu.example.edu.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.example.edu.Entity.Timetable;
import edu.example.edu.Entity.User;

public interface TimetableRepository extends JpaRepository<Timetable, Long> {

        // Already existing method (based on your service)
        List<Timetable> findByClassroom_ClassId(Long classId);

        // ✅ Check if ANY timetable exists for this teacher at given day & period
        boolean existsByTeacherAndDayOfWeekAndPeriodNumber(
                        User teacher,
                        Timetable.DayOfWeek dayOfWeek,
                        Integer periodNumber);

        // ✅ Same check, but ignore a particular timetableId (for update)
        boolean existsByTeacherAndDayOfWeekAndPeriodNumberAndTimetableIdNot(
                        User teacher,
                        Timetable.DayOfWeek dayOfWeek,
                        Integer periodNumber,
                        Long timetableId);

        // ✅ Get the actual conflicting entry
        java.util.Optional<Timetable> findFirstByTeacherAndDayOfWeekAndPeriodNumber(
                        User teacher,
                        Timetable.DayOfWeek dayOfWeek,
                        Integer periodNumber);

        // ✅ Same but for update
        java.util.Optional<Timetable> findFirstByTeacherAndDayOfWeekAndPeriodNumberAndTimetableIdNot(
                        User teacher,
                        Timetable.DayOfWeek dayOfWeek,
                        Integer periodNumber,
                        Long timetableId);

        // Mission tracking
        List<Timetable> findByClassroom_ClassIdAndDayOfWeek(Long classId, Timetable.DayOfWeek dayOfWeek);
}
