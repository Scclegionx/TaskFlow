package mobile_be.mobile_be.Service;

import lombok.extern.slf4j.Slf4j;
import mobile_be.mobile_be.Model.Tydstate;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.TydstateRepository;
import mobile_be.mobile_be.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.text.DateFormat;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import mobile_be.mobile_be.contains.enum_tydstate;

@Service
@Slf4j
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TydstateRepository tydstateRepository;

    public ResponseEntity<?> checkIn(Integer userId) {

        try {
            User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

            LocalDateTime now = LocalDateTime.now();
            String formattedDate = now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

            Tydstate tydstateExist = tydstateRepository.findByUser_idAndCheckinContaining(userId, formattedDate);
            if (tydstateExist != null) {
                return ResponseEntity.badRequest().body("ban da checkIn");
            }

            Tydstate tydstate = new Tydstate();
            tydstate.setUser_id(user.getId());
            tydstate.setCheckin(LocalDateTime.now());
            tydstateRepository.save(tydstate);
            return ResponseEntity.ok("Check in success");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Check in failed");
        }
    }

    public ResponseEntity<?> checkOut(Integer userId) {
        try {
            User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

            LocalDateTime now = LocalDateTime.now();
            String formattedDate = now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

            Tydstate tydstate = tydstateRepository.findByUser_idAndCheckinContaining(userId, formattedDate);

            if (tydstate == null) {
                return ResponseEntity.badRequest().body("ban can checkIn");
            }

            if (tydstate.getCheckout() != null) {
                return ResponseEntity.badRequest().body("ban da checkOut");
            }

            // checkout la thoi gian hien tai
            tydstate.setCheckout(LocalDateTime.now());

            float total_hours = 0;
            if (tydstate.getCheckin() != null && tydstate.getCheckout() != null) {
                float seconds = Duration.between(tydstate.getCheckin(), tydstate.getCheckout()).getSeconds();
                total_hours = seconds / 3600.0f; // Chuyển giây thành giờ
            }
            // làm tròn 1 chữ số thập phân
            total_hours = Math.round(total_hours * 10) / 10.0f;
            log.info("Total hours: " + total_hours);

            if (total_hours < 8) {
                tydstate.setStatus(enum_tydstate.Thieu.getValue());
            } else {
                tydstate.setStatus(enum_tydstate.Du.getValue());
            }

            tydstate.setTotal_hours(total_hours);
            tydstateRepository.save(tydstate);

            return ResponseEntity.ok("Check out success");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Check out failed");
        }
    }

    public ResponseEntity<?> getTydstate() {
        try {
            return ResponseEntity.ok(tydstateRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Get tydstate failed");
        }
    }
}
