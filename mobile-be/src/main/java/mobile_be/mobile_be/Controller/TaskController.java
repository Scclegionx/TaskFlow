package mobile_be.mobile_be.Controller;

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
    public ResponseEntity<Map<String, Integer>> getTaskCountByStatus() {
        return ResponseEntity.ok(taskService.getTaskCountByStatus());
    }

    // tao task ( ai lam thi sua lai)
    @PostMapping("/create-task")
    public ResponseEntity<?> createTask(@RequestBody TaskRequest taskRequest) {
        Task task = taskService.createTask(taskRequest);
        return ResponseEntity.ok("Task created successfully");
    }

    // api lay ra tat ca cac cong viec
    // da co ben project controller

    ///
    //

}
