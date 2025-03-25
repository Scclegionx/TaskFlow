package mobile_be.mobile_be.Controller;

import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.DTO.UpdateProfileRequest;
import mobile_be.mobile_be.Repository.UserRepository;
import mobile_be.mobile_be.DTO.UserDTO;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;


@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @GetMapping
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userRepository.save(user);
    }
    @GetMapping("/search")
    public ResponseEntity<UserDTO> searchUserByEmail(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email: " + email));

        UserDTO userDTO = new UserDTO(user);
        return ResponseEntity.ok(userDTO);
    }

    @GetMapping("/profile")
    public UserDTO getUserProfile(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new RuntimeException("Người dùng chưa xác thực");
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Chuyển đổi sang DTO
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setName(user.getName());
        userDTO.setEmail(user.getEmail());
        userDTO.setGender(user.getGender());
        userDTO.setPhoneNumber(user.getPhoneNumber());
        userDTO.setDateOfBirth(user.getDateOfBirth());
        userDTO.setActive(user.isActive());
        userDTO.setRoles(user.getRoles().stream()
                .map(role -> role.getName())  // Chỉ lấy tên của vai trò
                .collect(Collectors.toSet()));

        return userDTO;
    }
    @PutMapping("/profile/email")
    public ResponseEntity<UserDTO> updateEmail(@AuthenticationPrincipal UserDetails userDetails,
                                 @RequestBody Map<String, String> request) {
        if (userDetails == null) {
        throw new RuntimeException("Người dùng chưa xác thực");
    }

    User user = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

    if (request.containsKey("email")) {
        user.setEmail(request.get("email"));
        userRepository.save(user);
    }

    return ResponseEntity.ok(new UserDTO(user));
}
@PutMapping("/profile/update")
    public ResponseEntity<UserDTO> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> request) {

        if (userDetails == null) {
            throw new RuntimeException("Người dùng chưa xác thực");
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (request.containsKey("name")) {
            user.setName(request.get("name"));
        }

        if (request.containsKey("phoneNumber")) {
            user.setPhoneNumber(request.get("phoneNumber"));
        }

        if (request.containsKey("dateOfBirth")) {
            try {
                LocalDate dateOfBirth = LocalDate.parse(request.get("dateOfBirth"));
                user.setDateOfBirth(dateOfBirth);
            } catch (DateTimeParseException e) {
                throw new RuntimeException("Ngày sinh không hợp lệ (Định dạng YYYY-MM-DD)");
            }
        }

        // Cập nhật giới tính (0 = Nữ, 1 = Nam)
        if (request.containsKey("gender")) {
            int genderValue = Integer.parseInt(request.get("gender"));
            if (genderValue != 0 && genderValue != 1) {
                throw new RuntimeException("Giới tính không hợp lệ (0 = Nữ, 1 = Nam)");
            }
            user.setGender(genderValue);
        }

        userRepository.save(user);
        
        return ResponseEntity.ok(new UserDTO(user));
    }

@PutMapping("/profile/password")
public ResponseEntity<String> updatePassword(@AuthenticationPrincipal UserDetails userDetails,
                                             @RequestBody Map<String, String> request) {
    if (userDetails == null) {
        throw new RuntimeException("Người dùng chưa xác thực");
    }

    User user = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

    if (request.containsKey("oldPassword") && request.containsKey("newPassword")) {
        if (!passwordEncoder.matches(request.get("oldPassword"), user.getPassword())) {
            return ResponseEntity.badRequest().body("Old password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.get("newPassword")));
        userRepository.save(user);
        return ResponseEntity.ok("Password updated successfully");
    } else {
        return ResponseEntity.badRequest().body("Invalid request");
    }
}
}
