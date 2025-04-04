package mobile_be.mobile_be.Controller;

import mobile_be.mobile_be.DTO.response.ChamCongResponseDTO;
import mobile_be.mobile_be.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@Controller
@RequestMapping("/api/tydstate")
public class TydstateController {

    @Autowired
    private UserService userService;


    // api checkIn
    @PostMapping("/check-in")
    public ResponseEntity<?> checkIn(@RequestParam (value = "userId") Integer userId) {
        return userService.checkIn(userId);
    }

    // api checkout
    @PutMapping("/check-out")
    public ResponseEntity<?> checkOut(@RequestParam (value = "userId") Integer userId) {
        return userService.checkOut(userId);
    }

    // api lấy ra bảng chấm công
    @GetMapping("/get-tydstate")
    public ResponseEntity<?> getTydState(@RequestParam ( value = "startDate", required = false) String startDate,
                                                 @RequestParam ( value = "endDate", required = false) String endDate,
                                                 @RequestParam ( value = "textSearch", required = false) String textSearch) {
       var result = userService.getTydstate(startDate, endDate, textSearch);
       return ResponseEntity.ok(result);
    }
}
