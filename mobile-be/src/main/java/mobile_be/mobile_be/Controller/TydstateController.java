package mobile_be.mobile_be.Controller;

import mobile_be.mobile_be.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

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
    @PostMapping("/get-tydstate")
    public ResponseEntity<?> getTydState() {
        return userService.getTydstate();
    }
}
