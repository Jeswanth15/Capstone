package edu.example.edu.Service;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import edu.example.edu.DTO.LoginDTO;
import edu.example.edu.DTO.RegisterDTO;
import edu.example.edu.DTO.UserDTO;
import edu.example.edu.Entity.School;
import edu.example.edu.Entity.User;
import edu.example.edu.Entity.User.ApprovalStatus;
import edu.example.edu.Repository.SchoolRepository;
import edu.example.edu.Repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, SchoolRepository schoolRepository) {
        this.userRepository = userRepository;
        this.schoolRepository = schoolRepository;
        this.passwordEncoder = new BCryptPasswordEncoder(); 
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setUserId(user.getUserId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setApprovalStatus(user.getApprovalStatus().name());
        dto.setSchoolId(user.getSchool().getSchoolId());
        return dto;
    }

    // ✅ Register new user
    public UserDTO registerUser(RegisterDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already registered: " + dto.getEmail());
        }

        School school = schoolRepository.findById(dto.getSchoolId())
                .orElseThrow(() -> new RuntimeException("School not found with id " + dto.getSchoolId()));

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(User.Role.valueOf(dto.getRole()));
        user.setSchool(school);

        // Auto-approve admins
        if (user.getRole() == User.Role.ADMIN || user.getRole() == User.Role.SCHOOLADMIN) {
            user.setApprovalStatus(ApprovalStatus.APPROVED);
        } else {
            user.setApprovalStatus(ApprovalStatus.PENDING);
        }

        return convertToDTO(userRepository.save(user));
    }

    // ✅ Login user
    public UserDTO loginUser(LoginDTO dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (user.getApprovalStatus() != ApprovalStatus.APPROVED) {
            throw new RuntimeException("Your account is " + user.getApprovalStatus() + ". Please wait for approval.");
        }

        return convertToDTO(user);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        return userRepository.findById(id).map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("User not found with id " + id));
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) throw new RuntimeException("User not found with id " + id);
        userRepository.deleteById(id);
    }

    // ✅ Get pending users by school
    public List<UserDTO> getPendingUsersBySchool(Long schoolId) {
        return userRepository.findBySchool_SchoolIdAndApprovalStatus(schoolId, ApprovalStatus.PENDING)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // ✅ Approve user (school-admin restricted)
    public UserDTO approveUser(Long userId, Long adminSchoolId) throws AccessDeniedException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id " + userId));

        if (!user.getSchool().getSchoolId().equals(adminSchoolId)) {
            throw new AccessDeniedException("You can only approve users from your school.");
        }

        user.setApprovalStatus(ApprovalStatus.APPROVED);
        return convertToDTO(userRepository.save(user));
    }

    // ✅ Reject user (school-admin restricted)
    public UserDTO rejectUser(Long userId, Long adminSchoolId) throws AccessDeniedException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id " + userId));

        if (!user.getSchool().getSchoolId().equals(adminSchoolId)) {
            throw new AccessDeniedException("You can only reject users from your school.");
        }

        user.setApprovalStatus(ApprovalStatus.REJECTED);
        return convertToDTO(userRepository.save(user));
    }


    // Update user role (only principal can do this)
    public UserDTO updateUserRole(Long userId, String newRole, Long principalId) throws AccessDeniedException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id " + userId));

        User principal = userRepository.findById(principalId)
                .orElseThrow(() -> new RuntimeException("Principal not found with id " + principalId));

        // Only principal can change roles
        if (principal.getRole() != User.Role.PRINCIPAL) {
            throw new AccessDeniedException("Only principal can change user roles.");
        }

        // Only allow changing roles for users in the same school
        if (!user.getSchool().getSchoolId().equals(principal.getSchool().getSchoolId())) {
            throw new AccessDeniedException("You can only change roles for users in your school.");
        }

        user.setRole(User.Role.valueOf(newRole.toUpperCase()));
        return convertToDTO(userRepository.save(user));
    }

    public List<UserDTO> bulkRegister(List<RegisterDTO> usersDto) {
    return usersDto.stream().map(dto -> {
        if (userRepository.existsByEmail(dto.getEmail())) {
            // skip duplicates or handle as needed
            return null;
        }

        School school = null;
        if (dto.getSchoolId() != null) {
            school = schoolRepository.findById(dto.getSchoolId())
                    .orElseThrow(() -> new RuntimeException("School not found with id " + dto.getSchoolId()));
        }

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode("123456")); // default password
        user.setRole(User.Role.valueOf(dto.getRole().toUpperCase()));
        user.setSchool(school);

        if (user.getRole() == User.Role.ADMIN || user.getRole() == User.Role.SCHOOLADMIN) {
            user.setApprovalStatus(ApprovalStatus.APPROVED);
        } else {
            user.setApprovalStatus(ApprovalStatus.PENDING);
        }

        return convertToDTO(userRepository.save(user));
    }).filter(dto -> dto != null).collect(Collectors.toList());
}

public String forgotPassword(String email, String newPassword) {
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

    user.setPassword(passwordEncoder.encode(newPassword));
    userRepository.save(user);

    return "Password updated successfully";
}

    public List<UserDTO> getUsersBySchoolAndRole(Long schoolId, User.Role role) {
        List<User> users = userRepository.findBySchool_SchoolIdAndRole(schoolId, role);

        return users.stream().map(user -> {
            UserDTO dto = new UserDTO();
            dto.setUserId(user.getUserId());
            dto.setName(user.getName());
            dto.setEmail(user.getEmail());
            dto.setRole(user.getRole().name());
            dto.setSchoolId(user.getSchool() != null ? user.getSchool().getSchoolId() : null);
            dto.setApprovalStatus(user.getApprovalStatus().name());
            dto.setClassroomId(
                user.getClassroom() != null ? user.getClassroom().getClassId() : null
            );

            return dto;
        }).collect(Collectors.toList());
    }


}
