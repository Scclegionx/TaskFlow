package mobile_be.mobile_be.Controller;

import jakarta.servlet.http.HttpServletRequest;
import mobile_be.mobile_be.DTO.request.ForgotPasswordRequest;
import mobile_be.mobile_be.Model.BlacklistedToken;
import mobile_be.mobile_be.Model.Role;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.BlacklistRepository;
import mobile_be.mobile_be.Repository.UserRepository;
import mobile_be.mobile_be.Repository.RoleRepository;
import mobile_be.mobile_be.DTO.RegisterRequest;
import mobile_be.mobile_be.DTO.LoginRequest;
import mobile_be.mobile_be.Service.EmailService;
import mobile_be.mobile_be.Service.UserService;
import mobile_be.mobile_be.Utils.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;

import jakarta.servlet.http.HttpServletResponse;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final BlacklistRepository blacklistRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserService userService;

    @Autowired
    public AuthController(UserRepository userRepository, BlacklistRepository blacklistRepository, JwtUtil jwtUtil,RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.blacklistRepository = blacklistRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
        this.jwtUtil = jwtUtil;
        this.roleRepository = roleRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body("Passwords do not match");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already in use");
        }
        Role userRole = roleRepository.findByName(Role.RoleName.USER)
            .orElseThrow(() -> new RuntimeException("Default role USER not found"));
        
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setActive(true);
        user.setRoles(Set.of(userRole));
        userRepository.save(user);
        
        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Lấy roles của user qua join bảng role_user
        Set<String> roles = user.getRoles().stream()
                .map(role -> role.getName().toString()) // Hoặc .toString()
                .collect(Collectors.toSet());

        // Tạo JWT với thông tin id, email, roles
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), roles, user.getName(), user.getAvatar());

        response.addHeader("Set-Cookie", "token=" + token + "; HttpOnly; Secure; Path=/");

        Map<String, String> responseBody = new HashMap<>();
        responseBody.put("message", "Login successful!");
        responseBody.put("token", token);

        return ResponseEntity.ok(responseBody);
    }
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
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

        if (token != null) {
            BlacklistedToken blacklistedToken = new BlacklistedToken();
            blacklistedToken.setToken(token);
            blacklistRepository.save(blacklistedToken);
        }

        return ResponseEntity.ok("Logged out successfully");
    }

    // Yêu cầu quên mật khẩu
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        log.info("bat dau quen mat khau");
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Email không tồn tại!");
        }
        LocalDateTime now = LocalDateTime.now();
        // Tạo token reset
        String token = UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setTimeResetPasswordToken(now);
        userRepository.save(user);

        // Gửi email reset (nội dung email có nút chứa link reset)
        emailService.sendResetPasswordEmail(user.getEmail(), token);
        return ResponseEntity.ok("Email đã được gửi!");
    }

    // Khi người dùng bấm vào link trong email
    @GetMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam("token") String token) {

        try {
            log.info("bat dau thay doi mat khau");
            User user = userRepository.findByResetPasswordToken(token).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body("user không tồn tại!");
            }
            LocalDateTime now = LocalDateTime.now();
            // Kiểm tra token có hết hạn hay không
            if (user.getTimeResetPasswordToken() == null || user.getTimeResetPasswordToken().plusMinutes(15).isBefore(now)) {
                return ResponseEntity.badRequest().body("Token đã hết hạn!");
            }

            String newPassword = userService.genarateNewPassword();
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setResetPasswordToken(null); // Xóa token sau khi đã sử dụng
            userRepository.save(user);

            emailService.sendNewPasswordEmail(user.getEmail(), newPassword);
            return ResponseEntity.ok("Mật khẩu đã được thay đổi, vui lòng kiểm tra email!");

        } catch (Exception e) {
            log.error("Error in resetPassword: ", e);
            return ResponseEntity.status(500).body("Đã xảy ra lỗi trong quá trình đặt lại mật khẩu.");
        }
    }
}
