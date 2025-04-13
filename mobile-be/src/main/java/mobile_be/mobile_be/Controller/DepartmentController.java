package mobile_be.mobile_be.Controller;

import mobile_be.mobile_be.DTO.request.DepartmentRequestDTO;
import mobile_be.mobile_be.DTO.request.TeamRequestDTO;
import mobile_be.mobile_be.Model.Department;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.DepartmentRepository;
import mobile_be.mobile_be.Repository.UserRepository;
import mobile_be.mobile_be.Service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/api/department")
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

    @PostMapping("/create-department")
    public ResponseEntity<?> createDepartment(@RequestBody DepartmentRequestDTO  departmentRequestDTO) {
        try{
            var result = departmentService.createDepartment(departmentRequestDTO);
            return ResponseEntity.ok(result);
        }catch (Exception e){
            return ResponseEntity.badRequest().body("Error creating department: " + e.getMessage());
        }
    }

    @PutMapping("/update-department")
    public ResponseEntity<?> updateDepartment(@RequestBody DepartmentRequestDTO departmentRequestDTO) {
        try{
            var result = departmentService.updateDepartment(departmentRequestDTO);
            return ResponseEntity.ok(result);
        }catch (Exception e){
            return ResponseEntity.badRequest().body("Error updating department: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete-department")
    public ResponseEntity<?> deleteDepartment( @RequestParam (value = "departmentId", required = false) Integer departmentId) {
        try{
            var result = departmentService.deleteDepartment(departmentId);
            return ResponseEntity.ok(result);
        }catch (Exception e){
            return ResponseEntity.badRequest().body("Error deleting department: " + e.getMessage());
        }
    }

    @GetMapping("/get-all-department")
    public ResponseEntity<?> getDepartment( @RequestParam(value = "departmentId", required = false) Integer departmentId ,
                                            @RequestParam(value = "textSearch", required = false) String textSearch) {
        try{
            var result = departmentService.getAllDepartment(departmentId, textSearch);
            return ResponseEntity.ok(result);
        }catch (Exception e){
            return ResponseEntity.badRequest().body("Error getting department: " + e.getMessage());
        }
    }

    @GetMapping("/get-detail-department")
    public ResponseEntity<?> getDetailDepartment( @RequestParam(value = "departmentId", required = false) Integer departmentId) {
        try{
            var result = departmentService.getDetailDepartment(departmentId);
            return ResponseEntity.ok(result);
        }catch (Exception e){
            return ResponseEntity.badRequest().body("Error getting detail department: " + e.getMessage());
        }
    }

    @PostMapping("/create-team")
    public ResponseEntity<?> createTeam(@RequestBody TeamRequestDTO teamRequestDTO) {
        try{
            var result = departmentService.createTeam(teamRequestDTO);
            return ResponseEntity.ok(result);
        }catch (Exception e){
            return ResponseEntity.badRequest().body("Error creating team: " + e.getMessage());
        }
    }

    @PutMapping("/update-team")
    public ResponseEntity<?> updateTeam(@RequestBody TeamRequestDTO teamRequestDTO) {
        try{
            var result = departmentService.updateTeam(teamRequestDTO);
            return ResponseEntity.ok(result);
        }catch (Exception e){
            return ResponseEntity.badRequest().body("Error updating team: " + e.getMessage());
        }
    }
    @DeleteMapping("/delete-team")
    public ResponseEntity<?> deleteTeam( @RequestParam(value =  "teamId", required = false) Integer teamId) {
        try{
            var result = departmentService.deleteTeam(teamId);
            return ResponseEntity.ok(result);
        }catch (Exception e){
            return ResponseEntity.badRequest().body("Error deleting team: " + e.getMessage());
        }
    }

    @GetMapping("/get-detail-team")
    public ResponseEntity<?> getDetailTeam( @RequestParam(value =  "teamId", required = false) Integer teamId) {
        try{
            var result = departmentService.getDetailTeam(teamId);
            return ResponseEntity.ok(result);
        }catch (Exception e){
            return ResponseEntity.badRequest().body("Error getting team: " + e.getMessage());
        }
    }

    @PostMapping("/add-user-to-team")
    public ResponseEntity<?> addUserToTeam(@RequestParam(value =  "userId", required = false) Integer userId,
                                           @RequestParam(value =  "teamId", required = false) Integer teamId) {
        try{
            var result = departmentService.addUserToTeam(userId, teamId);
            return ResponseEntity.ok(result);
        }catch (Exception e){
            return ResponseEntity.badRequest().body("Error adding user to team: " + e.getMessage());
        }
    }

}
