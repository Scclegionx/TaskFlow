package mobile_be.mobile_be.Service;

import lombok.extern.slf4j.Slf4j;
import mobile_be.mobile_be.DTO.response.ChamCongResponseDTO;
import mobile_be.mobile_be.DTO.response.InfoUserResponseDTO;
import mobile_be.mobile_be.DTO.response.RatingResponseDTO;
import mobile_be.mobile_be.Mapper.RatingMapper;
import mobile_be.mobile_be.Model.Kpi;
import mobile_be.mobile_be.Model.Rating;
import mobile_be.mobile_be.Model.Tydstate;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.KpiRepository;
import mobile_be.mobile_be.Repository.RatingRepository;
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
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import mobile_be.mobile_be.contains.*;
import org.springframework.web.servlet.View;

@Service
@Slf4j
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TydstateRepository tydstateRepository;

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private RatingMapper ratingMapper;

    @Autowired
    private KpiRepository kpiRepository;

    public ResponseEntity<?> checkIn(Integer userId) {

        try {
            log.info("Check in userId: " + userId);
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
            log.info("Check out userId: " + userId);
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


            log.info("Check in time: " + tydstate.getCheckin());
            LocalTime checkinTime = tydstate.getCheckin().toLocalTime();
            LocalTime checkoutTime = tydstate.getCheckout().toLocalTime();

            if (total_hours >= 8 && checkinTime.isBefore(LocalTime.of(8, 1))) {
                tydstate.setStatus(enum_tydstate.Du.getValue());
            } else if (checkinTime.isAfter(LocalTime.of(8, 0)) && !checkoutTime.isBefore(LocalTime.of(17, 0))) {
                tydstate.setStatus(enum_tydstate.DiMuon.getValue());
            } else if (checkinTime.isAfter(LocalTime.of(8, 0)) && checkoutTime.isBefore(LocalTime.of(17, 0))) {
                tydstate.setStatus(enum_tydstate.DiMuonVeSom.getValue());
            } else if (checkinTime.isBefore(LocalTime.of(8, 1)) && checkoutTime.isBefore(LocalTime.of(17, 0))) {
                tydstate.setStatus(enum_tydstate.VeSom.getValue());
            }

            if (tydstate.getStatus() != enum_tydstate.Du.getValue() ){
                List<Kpi> kpiList = findByTimeAndUserId(formattedDate, userId);
                Kpi kpi =  kpiList.get(0);
                kpi.setMinusPoint(kpi.getMinusPoint() + 1);
                kpi.setTotalPoint(kpi.getPlusPoint() - kpi.getMinusPoint());
                if(kpi.getTotalPoint() >= kpi.getKpiRegistry()){
                    kpi.setStatus(enum_status_kpi.Du.getValue());
                }else{
                    kpi.setStatus(enum_status_kpi.ChuaDu.getValue());
                }
                kpiRepository.save(kpi);

            }

            tydstate.setTotal_hours(total_hours);
            tydstateRepository.save(tydstate);

            return ResponseEntity.ok("Check out success");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Check out failed");
        }
    }

    public List<Kpi> findByTimeAndUserId(String time, Integer userId) {
        LocalDate date = LocalDate.parse(time);  // tự động dùng định dạng yyyy-MM-dd

        // Chuyển về định dạng "yyyy-MM"
        String formattedDate = date.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        List<Kpi> kpiExist = kpiRepository.findByUserIdAndTime(userId, formattedDate);
        return kpiExist;
    }

    public String genarateNewPassword() {
        StringBuilder newPassword = new StringBuilder();
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        int length = 8; // Độ dài mật khẩu mới

        for (int i = 0; i < length; i++) {
            int index = (int) (Math.random() * characters.length());
            newPassword.append(characters.charAt(index));
        }

        return newPassword.toString();
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
            log.info(e.getMessage());
            return Arrays.asList();
        }
    }

    public ResponseEntity<?> getUserById(Integer userId){
        try{

            LocalDate startDate = LocalDate.now().withDayOfMonth(1);
            LocalDate endDate = LocalDate.now();

           Object[] results = userRepository.getUserById(userId, startDate, endDate);


           // doan nay de tranh loi khi ma khong co ban ghi
            if (results == null || results.length == 0) {
                results = userRepository.getUserById(userId, null, null);
            }

            Object[] result = (Object[]) results[0]; // Lấy dòng đầu tiên

            log.info("result haha : " + result.toString());

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
            log.error("co loi trong qua trinh lay user: " + e.getMessage());
            return ResponseEntity.badRequest().body("co loi trong qua trinh lay du lieu");
        }
    }

    public ResponseEntity<?> ratingUser(Integer userId, Integer star, String comment , Integer createdBy) {
        try {

            Rating rating = new Rating();
            rating.setUserId(userId);
            rating.setStar(star);
            rating.setContent(comment);
            rating.setCreatedBy(createdBy);
            rating.setCreatedAt(LocalDate.now());
            var result = ratingRepository.save(rating);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("Error: " + e.getMessage());
            return ResponseEntity.badRequest().body("co loi trong qua trinh lay du lieu");
        }
    }

    public ResponseEntity<?> updateRating(Integer userId, Integer star, String comment , Integer createdBy, Integer editRatingid) {
        try {
            log.info("haha nhay vao day");


            Rating rating = ratingRepository.findById(editRatingid).orElseThrow(() -> new RuntimeException("Rating not found"));
            rating.setUserId(userId);
            rating.setStar(star);
            rating.setContent(comment);
            rating.setCreatedBy(createdBy);
            rating.setCreatedAt(LocalDate.now());
            var result = ratingRepository.save(rating);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("Error: " + e.getMessage());
            return ResponseEntity.badRequest().body("co loi trong qua trinh lay du lieu");
        }
    }

    public ResponseEntity<?> getRatingUser( Integer userId){
        try {
            var listRating = ratingRepository.getRatingUser(userId);
            int totalStar = listRating.stream().mapToInt(r -> r.getStar()).sum();
            float averageStar = (float) totalStar / listRating.size();
            averageStar = Math.round(averageStar * 10f) / 10f;

            float finalAverageStar = averageStar;

            List<RatingResponseDTO> results = listRating.stream().map(rating ->{
                RatingResponseDTO ratingResponseDTO = ratingMapper.INSTANCE.toDTO(rating);
                User user = userRepository.findById(rating.getCreatedBy()).orElseThrow(() -> new RuntimeException("User not found"));
                ratingResponseDTO.setCreatedByName(user.getName());
                ratingResponseDTO.setAvatar(user.getAvatar());
                ratingResponseDTO.setAverageStar(finalAverageStar);


                return ratingResponseDTO;
            }).collect(Collectors.toList());



            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Error: " + e.getMessage());
            return ResponseEntity.badRequest().body("co loi trong qua trinh lay du lieu");
        }
    }

    public ResponseEntity<?> deleteRating(Integer ratingId) {
        try {
            Rating rating = ratingRepository.findById(ratingId).orElseThrow(() -> new RuntimeException("Rating not found"));
            ratingRepository.delete(rating);
            return ResponseEntity.ok("Xoa thanh cong");
        } catch (Exception e) {
            log.error("Error: " + e.getMessage());
            return ResponseEntity.badRequest().body("co loi trong qua trinh xoa du lieu");
        }
    }
}
