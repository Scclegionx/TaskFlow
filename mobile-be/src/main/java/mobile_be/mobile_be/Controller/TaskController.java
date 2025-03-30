package mobile_be.mobile_be.Controller;

import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.extern.slf4j.Slf4j;
import mobile_be.mobile_be.DTO.request.TaskRequest;
import mobile_be.mobile_be.Model.Task;
import mobile_be.mobile_be.Service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/api/tasks")
@Slf4j
public class TaskController {

    @Autowired
    private TaskService taskService;

    // api lay ra so luong cong viec theo tung trang thai\
    // dung cho man hinh home va cong viec
    @GetMapping("/get-task-count-by-status")
    public ResponseEntity<Map<String, Integer>> getTaskCountByStatus(@RequestParam(value = "type" , required = false) Integer type,
                                                                     @RequestParam(value = "userId", required = false) Integer userId) {
        return ResponseEntity.ok(taskService.getTaskCountByStatus(type, userId));
    }

    // tao task ( ai lam thi sua lai)
    @PostMapping("/create-task")
    public ResponseEntity<?> createTask(@RequestBody TaskRequest taskRequest) {
        Task task = taskService.createTask(taskRequest);
        return ResponseEntity.ok("Task created successfully");
    }

    // api lay ra tat ca cac cong viec
    // da co ben project controller


    //
    // api de lay ra trang thai tat ca cong viec / dung trong man hinh tat ca cong viec
    @GetMapping("/get-status-all-tasks")
    public ResponseEntity<Map<String, Integer>> getStatusAllTasks(@RequestParam(value = "type", required = false) Integer type) {
        return ResponseEntity.ok(taskService.getStatusAllTasks());
    }

}
