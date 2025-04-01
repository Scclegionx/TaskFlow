package mobile_be.mobile_be.Controller;


import mobile_be.mobile_be.Service.KpiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

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
    @PostMapping("/edit-kpi")
    public ResponseEntity<?> editKpi(@RequestParam (value = "userId", required = false) Integer userId,
                                    @RequestParam (value = "pointKpi", required = false) Integer pointKpi) {
        return null;
    }
}
