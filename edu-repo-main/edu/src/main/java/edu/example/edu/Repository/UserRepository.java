package edu.example.edu.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import edu.example.edu.Entity.User;
import edu.example.edu.Entity.User.ApprovalStatus;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findBySchool_SchoolId(Long schoolId);

    List<User> findBySchool_SchoolIdAndApprovalStatus(Long schoolId, ApprovalStatus approvalStatus);

    List<User> findByApprovalStatus(ApprovalStatus approvalStatus);

    List<User> findBySchool_SchoolIdAndRole(Long schoolId, User.Role role);

    List<User> findByRole(User.Role role);

    List<User> findByClassroom_ClassId(Long classroomId);
}
