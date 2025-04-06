package mobile_be.mobile_be.Service;

import lombok.extern.slf4j.Slf4j;
import mobile_be.mobile_be.DTO.response.ChamCongResponseDTO;
import mobile_be.mobile_be.DTO.response.InfoUserResponseDTO;
import mobile_be.mobile_be.Model.Tydstate;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.TydstateRepository;
import mobile_be.mobile_be.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.text.DateFormat;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import mobile_be.mobile_be.contains.enum_tydstate;
import org.springframework.web.servlet.View;

@Service
@Slf4j
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TydstateRepository tydstateRepository;
    @Autowired
    private View error;

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


            if (total_hours >=8 && tydstate.getCheckin().getHour() <= 8) {
                tydstate.setStatus(enum_tydstate.Du.getValue());
            } else if (tydstate.getCheckin().getHour() > 8 && tydstate.getCheckout().getHour() >= 17){
                tydstate.setStatus(enum_tydstate.DiMuon.getValue());
            }else if (tydstate.getCheckin().getHour() > 8 && tydstate.getCheckout().getHour() < 17){
                tydstate.setStatus(enum_tydstate.DiMuonVeSom.getValue());
            }else if (tydstate.getCheckin().getHour() <= 8 && tydstate.getCheckout().getHour() < 17){
                tydstate.setStatus(enum_tydstate.VeSom.getValue());
            }

            tydstate.setTotal_hours(total_hours);
            tydstateRepository.save(tydstate);

            return ResponseEntity.ok("Check out success");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Check out failed");
        }
    }

    public List<ChamCongResponseDTO> getTydstate(String startDate, String endDate, String textSearch) {
        try {
            List<Tydstate> typstateList = tydstateRepository.getAllTydstate(startDate, endDate, textSearch);

            // Định dạng lại theo kiểu yyyy-MM-dd HH:mm:ss
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            List<ChamCongResponseDTO> chamCongResponseDTOList = typstateList.stream().map(tydstate -> {
                ChamCongResponseDTO chamCongResponseDTO = new ChamCongResponseDTO();

                String checkInTime = "";
                String checkOutTime = "chưa chưa ra về";
               if (tydstate.getCheckin() != null) {
                    checkInTime = tydstate.getCheckin().format(formatter);
                }
               if (tydstate.getCheckout() != null) {
                    checkOutTime = tydstate.getCheckout().format(formatter);
                }

                chamCongResponseDTO.setId(tydstate.getId());
                chamCongResponseDTO.setUser_id(tydstate.getUser_id());
                chamCongResponseDTO.setCheckin(checkInTime);
                chamCongResponseDTO.setCheckout(checkOutTime);
                chamCongResponseDTO.setStatus(tydstate.getStatus());
                chamCongResponseDTO.setTotal_hours(tydstate.getTotal_hours());

                User user = userRepository.findById(tydstate.getUser_id()).orElseThrow(() -> new RuntimeException("User not found"));
                chamCongResponseDTO.setUsername(user.getName());
                chamCongResponseDTO.setAvatar(user.getAvatar());
                return chamCongResponseDTO;
            }).toList();


           return chamCongResponseDTOList;
        } catch (Exception e) {
            log.info(error.toString());
            return Arrays.asList();
        }
    }

    public ResponseEntity<?> getUserById(Integer userId){
        try{

            LocalDate startDate = LocalDate.now().withDayOfMonth(1);
            LocalDate endDate = LocalDate.now();

           Object[] results = userRepository.getUserById(userId, startDate, endDate);

            if (results == null) {
                return ResponseEntity.badRequest().body("khong tim thay user");
            }

            Object[] result = (Object[]) results[0]; // Lấy dòng đầu tiên


            Integer id = (result[0] instanceof Integer) ? (Integer) result[0] : null;
            String name = (result[1] instanceof String) ? (String) result[1] : null;
            String email = (result[2] instanceof String) ? (String) result[2] : null;
            Integer gender = (result[3] instanceof Integer) ? (Integer) result[3] : null;
            String dob = (result[4] instanceof String) ? (String) result[4] : null;
            Integer totalPoint = (result[5] instanceof Number) ? ((Number) result[5]).intValue() : null;
            Integer kpiRegistry = (result[6] instanceof Number) ? ((Number) result[6]).intValue() : null;
            Float totalHours = (result[7] instanceof Number) ? ((Number) result[7]).floatValue() : null;
            String avatar = (result[8] instanceof String) ? (String) result[8] : null;

            String total_point = (totalPoint != null ? totalPoint.toString() : "0") +
                    " / " +
                    (kpiRegistry != null ? kpiRegistry.toString() : "0");

            String genderDatail= "";
            if(gender == null){
                genderDatail = "Chưa cập nhật";
            }else if (gender == 0){
                genderDatail = "Nam";
            }else if (gender == 1){
                genderDatail = "Nữ";
            }

            if(dob == null){
                dob = "Chưa cập nhật";
            }

            InfoUserResponseDTO  infoUserResponseDTO = new InfoUserResponseDTO();
            infoUserResponseDTO.setId(id);
            infoUserResponseDTO.setName(name);
            infoUserResponseDTO.setEmail(email);
            infoUserResponseDTO.setGender(genderDatail);
            infoUserResponseDTO.setDateOfBirth(dob);
            infoUserResponseDTO.setTotalPoint(total_point);
            infoUserResponseDTO.setTotalHours(totalHours);
            infoUserResponseDTO.setAvatar(avatar);


            return ResponseEntity.ok(infoUserResponseDTO);
        }catch (Exception e){
            log.error("Error: " + e.getMessage());
            return ResponseEntity.badRequest().body("co loi trong qua trinh lay du lieu");
        }
    }
}
