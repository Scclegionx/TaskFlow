package mobile_be.mobile_be.Controller;

import lombok.extern.slf4j.Slf4j;
import mobile_be.mobile_be.DTO.request.TaskRequest;
import mobile_be.mobile_be.Model.Task;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.UserRepository;
import mobile_be.mobile_be.Service.ProjectService;
import mobile_be.mobile_be.Service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/api/tasks")
@Slf4j
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private UserRepository userRepository;

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
    public ResponseEntity<?> createTask(@RequestBody TaskRequest request) {
        try {
            Integer taskId=taskService.createTask(request);
            return ResponseEntity.ok(taskId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi tạo nhiệm vụ: " + e.getMessage());
        }
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

        try{
            return ResponseEntity.ok(taskService.taskApproveFinish(taskId));
        }catch (Exception e){
            log.info("Error: " + e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Lỗi khi duyệt hoàn thành nhiệm vụ: " + e.getMessage());
        }
    }


    @GetMapping("/get-task-pending")
    public ResponseEntity<?> getTaskPending(@RequestParam(value = "projectId", required = false) Integer projectId,
                                            @RequestParam(value = "userId", required = false) Integer userId,
                                            @RequestParam(value = "type", required = false) Integer type,
                                            @RequestParam(value = "textSearch", required = false) String textSearch) {
        return ResponseEntity.ok(projectService.getTaskPending(projectId, userId, type, textSearch));
    }


    // gia han cong viec
    @PutMapping("/extend-deadline")
    public ResponseEntity<?> extendDeadline(@RequestParam(value = "taskId", required = false) Integer taskId,
                                            @RequestParam(value = "toDate", required = false) String toDate) {
        return ResponseEntity.ok(taskService.extendDeadline(taskId, toDate));
    }

    @GetMapping("/get-my-task")
    public ResponseEntity<?> getMyTask(@RequestParam(value = "projectId", required = false) Integer projectId,
                                            @RequestParam(value = "userId", required = false) Integer userId,
                                            @RequestParam(value = "type", required = false) Integer type,
                                            @RequestParam(value = "textSearch", required = false) String textSearch) {
        return ResponseEntity.ok(projectService.getMyTask(projectId, userId, type, textSearch));
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
    @PutMapping("/update-progress")
    public ResponseEntity<?> updateProgress(@RequestParam(value = "taskId", required = false) Integer taskId,
                                            @RequestParam(value = "progress", required = false) Integer progress) {
        return ResponseEntity.ok(taskService.updateProgress(taskId, progress));
    }


    @PutMapping("/assign")
    public ResponseEntity<?> assignTask(
            @RequestParam Integer taskId,
            @RequestParam Integer userId) {
        try {
            Task updatedTask = taskService.assignTask(taskId, userId);
            // Tạo response object với thông tin cần thiết
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Gán nhiệm vụ thành công");
            
            // Lấy thông tin tất cả người được assign
            List<Map<String, Object>> assignees = new ArrayList<>();
            for (User assignee : updatedTask.getAssignees()) {
                Map<String, Object> assigneeInfo = new HashMap<>();
                assigneeInfo.put("id", assignee.getId());
                assigneeInfo.put("name", assignee.getName());
                assigneeInfo.put("avatar", assignee.getAvatar());
                assignees.add(assigneeInfo);
            }
            response.put("assignees", assignees);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Lỗi khi gán nhiệm vụ: " + e.getMessage());
        }
    }

    @PutMapping("/update-task")
    public ResponseEntity<?> updateTask(@RequestBody TaskRequest taskRequest,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
            Task updatedTask = taskService.updateTask(taskRequest, user.getId());
            return ResponseEntity.ok("Cập nhật nhiệm vụ thành công");
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Lỗi khi cập nhật nhiệm vụ: " + e.getMessage());
        }
    }

    @PostMapping("/rollback-task")
    public ResponseEntity<?> rollBackTask(@RequestParam(value = "taskHistoryId", required = false) Integer taskHistoryId) {

        try{
            var rollbackTaskHistory = taskService.rollbackTask(taskHistoryId);
            return ResponseEntity.ok(rollbackTaskHistory);
        }catch (Exception e){
            log.info("Error: " + e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Lỗi khi phục hồi nhiệm vụ: " + e.getMessage());
        }
    }

    @GetMapping("/get-task-history")
    public ResponseEntity<?> getTaskHistory(@RequestParam(value = "taskHistoryId", required = false) Integer taskHistoryId,
                                            @RequestParam(value = "textSearch", required = false) String textSearch) {
        try {
            var taskHistory = taskService.getTaskHistory(taskHistoryId , textSearch);
            return ResponseEntity.ok(taskHistory);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Lỗi khi lấy lịch sử nhiệm vụ: " + e.getMessage());
        }
    }
    @PutMapping("/reject-task")
    public ResponseEntity<?> rejectTask(@RequestParam(value = "taskId", required = false) Integer taskId,
                                        @RequestParam(value = "reasonId", required = false) Integer reasonId) {
        return ResponseEntity.ok(taskService.rejectTask(taskId, reasonId));
    }

    @PutMapping("/accept-task")
    public ResponseEntity<?> acceptTask(@RequestParam(value = "taskId", required = false) Integer taskId,
                                        @RequestParam(value = "userId", required = false) Integer userId) {

        try{
            Task task = projectService.acceptTask(taskId, userId);
            return ResponseEntity.ok(task);
        }catch (Exception e){
            log.info("Error: " + e.getMessage());
        }
        return ResponseEntity.badRequest().body("co loi trong qua trinh xu ly");
    }

    @GetMapping("/get-main-tasks")
    public ResponseEntity<?> getMainTasks(@RequestParam Integer projectId) {
        try {
            List<Task> mainTasks = taskService.getMainTasks(projectId);
            return ResponseEntity.ok(mainTasks);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Lỗi khi lấy danh sách công việc chính: " + e.getMessage());
        }
    }

    @GetMapping("/get-sub-tasks")
    public ResponseEntity<?> getSubTasks(@RequestParam Integer parentId) {
        try {
            List<Task> subTasks = taskService.getSubTasks(parentId);
            return ResponseEntity.ok(subTasks);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Lỗi khi lấy danh sách công việc con: " + e.getMessage());
        }
    }
}
