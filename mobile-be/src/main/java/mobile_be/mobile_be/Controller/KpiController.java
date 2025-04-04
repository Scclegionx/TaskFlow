package mobile_be.mobile_be.Controller;


import mobile_be.mobile_be.Service.KpiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/api/kpi")
public class KpiController {
    @Autowired
    private KpiService kpiService;


    // api dang ky kpi
    @PostMapping("/register-kpi")
    public ResponseEntity<?> registerKpi(@RequestParam (value = "userId", required = false) Integer userId,
                                         @RequestParam (value = "pointKpi", required = false) Integer pointKpi) {

       return kpiService.registerKpi(userId, pointKpi);

    }

    // api lay ra kpi  theo thang
    @GetMapping("/get-kpi-by-month")
    public ResponseEntity<?> getKpiByMonth(@RequestParam (value = "time", required = false) String time,
                                           @RequestParam ( value = "textSearch", required = false) String textSearch) {
        return kpiService.getKpiByMonth( time, textSearch);
    }

    // api sửa kpi
    @PutMapping("/edit-kpi")
    public ResponseEntity<?> editKpi(@RequestParam (value = "kpiId", required = false) Integer kpiId,
                                    @RequestParam (value = "pointKpi", required = false) Integer pointKpi) {
        return kpiService.editKpi(kpiId, pointKpi);
    }


    // api xoa kpi
    // chi cho phep xoa cua chinh minh
    @DeleteMapping("/delete-kpi")
    public ResponseEntity<?> deleteKpi(@RequestParam (value = "kpiId", required = false) Integer kpiId) {
        return kpiService.deleteKpi(kpiId);
    }

}
