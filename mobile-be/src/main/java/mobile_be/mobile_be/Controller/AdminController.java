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

        Set<String> roles = userDetails.getAuthorities()
                                       .stream()
                                       .map(grantedAuthority -> grantedAuthority.getAuthority())
                                       .collect(Collectors.toSet());

        if (!roles.contains("ROLE_ADMIN")) { // ROLE_ADMIN thay vì ADMIN
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

        Set<String> roles = userDetails.getAuthorities()
                                       .stream()
                                       .map(grantedAuthority -> grantedAuthority.getAuthority())
                                       .collect(Collectors.toSet());

        if (!roles.contains("ROLE_ADMIN")) {
            return ResponseEntity.status(403).body("Không có quyền: Bạn không phải là admin!");
        }

        userRepository.save(user);
        return ResponseEntity.ok("Thêm người dùng thành công!");
    }
}
