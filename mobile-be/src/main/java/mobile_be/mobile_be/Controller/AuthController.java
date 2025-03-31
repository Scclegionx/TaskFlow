package mobile_be.mobile_be.Controller;

import jakarta.servlet.http.HttpServletRequest;
import mobile_be.mobile_be.Model.BlacklistedToken;
import mobile_be.mobile_be.Model.Role;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.BlacklistRepository;
import mobile_be.mobile_be.Repository.UserRepository;
import mobile_be.mobile_be.Repository.RoleRepository;
import mobile_be.mobile_be.DTO.RegisterRequest;
import mobile_be.mobile_be.DTO.LoginRequest;
import mobile_be.mobile_be.Utils.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;

import jakarta.servlet.http.HttpServletResponse;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final BlacklistRepository blacklistRepository;

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
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), roles, user.getName());

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
}
