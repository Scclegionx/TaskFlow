package mobile_be.mobile_be.Controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.servlet.http.HttpServletRequest;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.DTO.UpdateProfileRequest;
import mobile_be.mobile_be.Repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import mobile_be.mobile_be.Utils.JwtUtil;
import mobile_be.mobile_be.DTO.UserDTO;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final Cloudinary cloudinary;
    private final BCryptPasswordEncoder passwordEncoder;

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public UserController(Cloudinary cloudinary, UserRepository userRepository, JwtUtil jwtUtil) {
        this.cloudinary = cloudinary;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
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

        // them avatar
        userDTO.setAvatar(user.getAvatar());
        userDTO.setName(user.getName());
        userDTO.setEmail(user.getEmail());
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
@PutMapping("/profile/name")
    public ResponseEntity<UserDTO> updateName(@AuthenticationPrincipal UserDetails userDetails,
                                 @RequestBody Map<String, String> request) {

    if (userDetails == null) {
        throw new RuntimeException("Người dùng chưa xác thực");
    }

    User user = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

    if (request.containsKey("name")) {
        user.setName(request.get("name"));
        userRepository.save(user);
    }

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

    @PostMapping("/change-avatar")
    public ResponseEntity<?> changeAvatar(HttpServletRequest request,
                                          @RequestPart("avatar") MultipartFile file) throws IOException {
        // Kiểm tra file có tồn tại hay không
        System.out.println("Đã vào đây");
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("File không hợp lệ");
        }

        // Lấy token từ request
        String token = null;
        String authorizationHeader = request.getHeader("Authorization");

        if (request.getCookies() != null) {
            for (var cookie : request.getCookies()) {
                if ("token".equals(cookie.getName())) {
                    token = cookie.getValue();
                }
            }
        }

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            token = authorizationHeader.substring(7); // Cắt bỏ "Bearer "
        }
        System.out.println(token);

        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token không hợp lệ");
        }

        // Giải mã token để lấy email
        String email = jwtUtil.extractEmail(token);
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Không thể xác thực người dùng");
        }

        // Tìm người dùng từ email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Upload file lên Cloudinary
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
        String imageUrl = (String) uploadResult.get("url");

        // Cập nhật avatar
        user.setAvatar(imageUrl);
        userRepository.save(user);

        return ResponseEntity.ok(user);
    }

}


