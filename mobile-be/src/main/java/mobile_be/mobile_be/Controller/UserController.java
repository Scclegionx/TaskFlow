package mobile_be.mobile_be.Controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.servlet.http.HttpServletRequest;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import mobile_be.mobile_be.Utils.JwtUtil;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final Cloudinary cloudinary;

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public UserController(Cloudinary cloudinary, UserRepository userRepository, JwtUtil jwtUtil) {
        this.cloudinary = cloudinary;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userRepository.save(user);
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
