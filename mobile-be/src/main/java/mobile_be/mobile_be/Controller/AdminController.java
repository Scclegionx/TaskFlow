package mobile_be.mobile_be.Controller;

import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Lấy danh sách tất cả user (Chỉ ADMIN mới được gọi)
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("Chưa xác thực: Bạn chưa đăng nhập!");
        }
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Set<String> roles = user.getRoles().stream()
                                .map(role -> role.getName().name())  // Chỉ lấy tên của vai trò
                                .collect(Collectors.toSet());
        System.out.println("User Roles: " + roles);

        if (!roles.contains("ADMIN")) { // ROLE_ADMIN thay vì ADMIN
            return ResponseEntity.status(403).body("Không có quyền: Bạn không phải là admin!");
        }

        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    // Thêm người dùng (Chỉ ADMIN)
    @PostMapping("/add-user")
    public ResponseEntity<?> addUser(@RequestBody User user, @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("Chưa xác thực: Bạn chưa đăng nhập!");
        }

        User useradmin = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Set<String> roles = useradmin.getRoles().stream()
                                .map(role -> role.getName().name())  // Chỉ lấy tên của vai trò
                                .collect(Collectors.toSet());
        System.out.println("User Roles: " + roles);

        if (!roles.contains("ADMIN")) {
            return ResponseEntity.status(403).body("Không có quyền: Bạn không phải là admin!");
        }

        userRepository.save(user);
        return ResponseEntity.ok("Thêm người dùng thành công!");
    }
    @DeleteMapping("/delete-user/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id, @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("Chưa xác thực: Bạn chưa đăng nhập!");
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Set<String> roles = user.getRoles().stream()
                                .map(role -> role.getName().name())  // Chỉ lấy tên của vai trò
                                .collect(Collectors.toSet());
        System.out.println("User Roles: " + roles);

        if (!roles.contains("ADMIN")) {
            return ResponseEntity.status(403).body("Không có quyền: Bạn không phải là admin!");
        }

        if (!userRepository.existsById(id)) {
            return ResponseEntity.status(404).body("Không tìm thấy người dùng với ID: " + id);
        }

        userRepository.deleteById(id);
        return ResponseEntity.ok("Xóa người dùng thành công!");
    }
}
