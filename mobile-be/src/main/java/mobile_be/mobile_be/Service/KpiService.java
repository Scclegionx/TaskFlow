package mobile_be.mobile_be.Service;

import lombok.extern.slf4j.Slf4j;
import mobile_be.mobile_be.DTO.response.KpiResponseDTO;
import mobile_be.mobile_be.Mapper.KpiMapper;
import mobile_be.mobile_be.Model.Kpi;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.KpiRepository;
import mobile_be.mobile_be.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import mobile_be.mobile_be.contains.enum_status_kpi;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class KpiService {

    @Autowired
    private KpiRepository kpiRepository;
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;


    public ResponseEntity<?> registerKpi(Integer userId, Integer point_kpi) {

        // Lấy ngày hiện tại
        LocalDate today = LocalDate.now();

        // Định dạng thành yyyy-MM
        String formattedDate = today.format(DateTimeFormatter.ofPattern("yyyy-MM"));

        // check kpi ton tai
        List<Kpi> kpiExist = kpiRepository.findByUserIdAndTime(userId, formattedDate);
        if (kpiExist != null && !kpiExist.isEmpty()) {
            log.info("kpiExist: " + kpiExist);
            return ResponseEntity.badRequest().body("Bạn đã đăng ký KPI cho tháng này rồi  ");
        }

        Kpi newKpi = new Kpi();
        newKpi.setUserId(userId);
        newKpi.setKpiRegistry(point_kpi);
        newKpi.setTime(today);
        newKpi.setMinusPoint(0);
        newKpi.setPlusPoint(0);
        newKpi.setTotalPoint(0);
        newKpi.setStatus(enum_status_kpi.ChuaDu.getValue());

        kpiRepository.save(newKpi);

        return ResponseEntity.ok("đăng ký KPI thành công");
    }

    public ResponseEntity<?> getKpiByMonth(String startDate, String endDate, String textSearch) {

        List<Kpi> listKpi = kpiRepository.getKpiByMonth(startDate, endDate , textSearch);

        List<KpiResponseDTO> results = listKpi.stream().map(kpi -> {
            KpiResponseDTO kpiResponseDTO = KpiMapper.INSTANCE.toDTO(kpi);
            Optional<User> user = userRepository.findById(kpi.getUserId());
            if (user.isPresent()) {
                kpiResponseDTO.setUserName(user.get().getName());
                kpiResponseDTO.setAvatar(user.get().getAvatar());
            }
            return kpiResponseDTO;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(results);
    }

    public ResponseEntity<?> deleteKpi(Integer kpiId) {

        log.info("kpiId: " + kpiId);
        // Lấy ngày hiện tại
        LocalDate today = LocalDate.now();

        // Định dạng thành yyyy-MM
        String formattedDate = today.format(DateTimeFormatter.ofPattern("yyyy-MM"));

        Kpi kpi = kpiRepository.findById(kpiId).orElse(null);
        if (kpi == null) {
            return ResponseEntity.badRequest().body("KPI không tồn tại");
        }
        kpiRepository.deleteById(kpi.getId());
        return ResponseEntity.ok("Xóa KPI thành công");
    }

    public ResponseEntity<?> editKpi(Integer kpiId, Integer point_kpi) {
        // Lấy ngày hiện tại
        LocalDate today = LocalDate.now();

        // Định dạng thành yyyy-MM
        String formattedDate = today.format(DateTimeFormatter.ofPattern("yyyy-MM"));

        Kpi kpi = kpiRepository.findById(kpiId).orElse(null);
        if (kpi == null) {
            return ResponseEntity.badRequest().body("KPI không tồn tại");
        }
        kpi.setKpiRegistry(point_kpi);
        kpiRepository.save(kpi);
        return ResponseEntity.ok("Sửa KPI thành công");
    }


}
