package mobile_be.mobile_be.Controller;

import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.extern.slf4j.Slf4j;
import mobile_be.mobile_be.DTO.request.TaskRequest;
import mobile_be.mobile_be.Model.Task;
import mobile_be.mobile_be.Service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

    // xin chao cac ban
    //

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


    // api lay ra thong tin chi tiet cong viec
    // dung trong man chi tiet cong viec
    @GetMapping("/get-task-detail")
    public ResponseEntity<Task> getTaskDetail(@RequestParam(value = "taskId", required = false) Integer taskId) {
        return ResponseEntity.ok(taskService.getTaskDetail(taskId));
    }

    // api chuyen trang thai hoan thanh cong viec
    @PutMapping("/mark-complete")
    public ResponseEntity<?> markComplete(@RequestParam(value = "taskId", required = false) Integer taskId) {
        return ResponseEntity.ok(taskService.markComplete(taskId));
    }

    // api cho pm duyet cong viec hoan thanh
    @PutMapping("/task-approve-finish")
    public ResponseEntity<?> taskApproveFinish(@RequestParam(value = "taskId", required = false) Integer taskId) {
        return ResponseEntity.ok(taskService.taskApproveFinish(taskId));
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<?> deleteTask(@PathVariable Integer taskId) {
        try {
            taskService.deleteTask(taskId);
            return ResponseEntity.ok("Xóa nhiệm vụ thành công");
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Lỗi khi xóa nhiệm vụ: " + e.getMessage());
        }
    }

    @PutMapping("/assign")
    public ResponseEntity<?> assignTask(
            @RequestParam Integer taskId,
            @RequestParam Integer userId) {
        try {
            taskService.assignTask(taskId, userId);
            return ResponseEntity.ok("Gán nhiệm vụ thành công");
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Lỗi khi gán nhiệm vụ: " + e.getMessage());
        }
    }

    @PutMapping("/update-task")
    public ResponseEntity<?> updateTask(@RequestBody TaskRequest taskRequest) {
        try {
            Task updatedTask = taskService.updateTask(taskRequest);
            return ResponseEntity.ok("Cập nhật nhiệm vụ thành công");
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Lỗi khi cập nhật nhiệm vụ: " + e.getMessage());
        }
    }
}
