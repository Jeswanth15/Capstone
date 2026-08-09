package edu.example.edu.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.example.edu.Entity.ClassSubject;
import edu.example.edu.Entity.Classroom;
import edu.example.edu.Entity.Subject;
import edu.example.edu.Entity.User;

@Repository
public interface ClassSubjectRepository extends JpaRepository<ClassSubject, Long> {

    List<ClassSubject> findByClassroomAndSubject(Classroom classroom, Subject subject);

    boolean existsByClassroomAndSubjectAndTeacher(Classroom classroom, Subject subject, User teacher);
}
