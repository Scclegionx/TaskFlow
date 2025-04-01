package mobile_be.mobile_be.Service;

import lombok.extern.slf4j.Slf4j;
import mobile_be.mobile_be.DTO.response.KpiResponseDTO;
import mobile_be.mobile_be.Mapper.KpiMapper;
import mobile_be.mobile_be.Model.Kpi;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.KpiRepository;
import mobile_be.mobile_be.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.HikariCheckpointRestoreLifecycle;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
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
        Kpi kpiExist = kpiRepository.findByUserIdAndTime(userId, formattedDate);
        if (kpiExist != null) {
            return ResponseEntity.badRequest().body("Bạn đã đăng ký KPI cho tháng này rồi  " + kpiExist.getId());
        }

        Kpi newKpi = new Kpi();
        newKpi.setUserId(userId);
        newKpi.setKpiRegistry(point_kpi);
        newKpi.setTime(today);

        kpiRepository.save(newKpi);

       return ResponseEntity.ok("đăng ký KPI thành công");
    }

    public ResponseEntity<?> getKpiByMonth(String time, String textSearch) {
        if (time == null) {
            LocalDate today = LocalDate.now();
            time = today.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        }
        List<Kpi> listKpi = kpiRepository.getKpiByMonth(time, textSearch);

       List<KpiResponseDTO> results = listKpi.stream().map(kpi ->{
           KpiResponseDTO kpiResponseDTO = KpiMapper.INSTANCE.toDTO(kpi);
              Optional<User> user = userRepository.findById(kpi.getUserId());
                if (user.isPresent()) {
                    kpiResponseDTO.setUserName(user.get().getName());
                }
                return kpiResponseDTO;
               }).collect(Collectors.toList());

        return ResponseEntity.ok(results);
    }
}
