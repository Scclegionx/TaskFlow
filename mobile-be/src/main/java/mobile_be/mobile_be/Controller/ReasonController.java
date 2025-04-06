package mobile_be.mobile_be.Controller;


import mobile_be.mobile_be.Model.Reason;
import mobile_be.mobile_be.Repository.ReasonRespository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/api/reason")
public class ReasonController {

    @Autowired
    private ReasonRespository reasonRespository;

    @GetMapping("/get-all-reason")
    public ResponseEntity<List<Reason>> getAllReason() {
        List<Reason> reasons = reasonRespository.findAll();
        return ResponseEntity.ok(reasons);
    }

}
