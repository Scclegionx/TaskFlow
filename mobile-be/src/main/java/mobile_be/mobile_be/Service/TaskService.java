package mobile_be.mobile_be.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mobile_be.mobile_be.DTO.request.TaskRequest;
import mobile_be.mobile_be.Model.*;
import mobile_be.mobile_be.Repository.*;
import mobile_be.mobile_be.contains.enum_projectStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import mobile_be.mobile_be.contains.enum_taskStatus;
import mobile_be.mobile_be.contains.enum_levelTask;
import mobile_be.mobile_be.contains.enum_status_kpi;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;


@Service
@Slf4j
@RequiredArgsConstructor
public class TaskService {
    @Autowired
    private NotificationService notificationService;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private KpiRepository kpiRepository;
    @Autowired
    private KpiService kpiService;
    @Autowired
    private ProjectMemberRepository projectMemberRepository;


    // type == null la lay tat ca cac trang thai
    // type == 0 la giao
    // type == 1 la duoc giao

    public Map<String, Integer> getTaskCountByStatus(Integer type, Integer userId) {
        List<Object[]> results = new ArrayList<>();
        if (type == null){
            results = taskRepository.getAllTaskCountByStatus();
        }else if(type == 0){
            results = taskRepository.getTaskCountByStatusGiao(userId);
        }else if(type == 1){
            results = taskRepository.getTaskCountByStatusDuocGiao(userId);
        }


        Map<Integer, Integer> result = new HashMap<>();

        for (Object[] row : results) {
            Integer status = ((Number) row[0]).intValue();  // Ép kiểu đúng
            Integer count = ((Number) row[1]).intValue();
            result.put(status, count);
        }

        // Chuyển đổi Map<Integer, Integer> -> Map<String, Integer>
        Map<String, Integer> response = new HashMap<>();
        response.put("IN_PROGRESS", result.getOrDefault(1, 0));
        response.put("COMPLETED", result.getOrDefault(2, 0));
        response.put("CANCELLED", result.getOrDefault(3, 0));
        response.put("OVERDUE", result.getOrDefault(4, 0));
        return response;
    }

    public Task createTask(TaskRequest taskRequest) {
        Task task = new Task();
        List<User> user = userRepository.findAllById(taskRequest.getAssignedTo());
        Project project = projectRepository.findById(taskRequest.getProjectId()).orElse(null);
        task.setTitle(taskRequest.getTitle());
        task.setProject(project);
        task.setDescription(taskRequest.getDescription());
        task.setToDate(taskRequest.getToDate());
        task.setFromDate(taskRequest.getFromDate());
        task.setStatus(taskRequest.getStatus());
        task.setLevel(taskRequest.getLevel());
        task.setAssignees(user);
        task.setCreatedAt(LocalDateTime.now());
        // doan nay sua lai thanh  user tu token hien tai
        task.setCreatedBy(taskRequest.getCreatedBy());
        taskRepository.save(task);
        String slug = "/tasks/" + task.getId();
        for(User u:user){
          notificationService.sendNotification(u.getId(),"test tasks",slug);  
        }
        
        return task;
    }


    public List<Task> getAllTasks() {
        List<Task> listTask =  taskRepository.findAll();
        log.info("List task: {}", listTask.get(0).getTitle());
        return listTask;
    }

    public Map<String, Integer> getStatusAllTasks() {
        Map<String , Integer> result = new HashMap<>();
      List<Task>  listTasks = taskRepository.findTasksByStatus(enum_taskStatus.IN_PROGRESS.getValue());
      if (listTasks != null){
            result.put("IN_PROGRESS", 1);
      }else{
            result.put("COMPLETED", 2);
      }
      return result;
    }

    public Task getTaskDetail(Integer taskId) {
        log.info("haha");
        Task task = taskRepository.getTaskDetail(taskId);
        if (task.getStatus() == enum_taskStatus.IN_PROGRESS.getValue()
                && task.getToDate() != null) {
            if (task.getToDate().isBefore(LocalDateTime.now())) {
                task.setStatus(enum_taskStatus.OVERDUE.getValue());
            }
        }
        return task;
    }

    public Task markComplete(Integer taskId) {
        log.info("Task ID: {}", taskId);
        Task task = taskRepository.findById(taskId);
        if (task != null) {
            task.setWaitFinish(1);
            taskRepository.save(task);
        }
        return task;
    }

    public Task taskApproveFinish(Integer taskId) {
        Task task = taskRepository.findById(taskId);
        if (task != null) {
            task.setStatus(enum_taskStatus.COMPLETED.getValue());
            task.setWaitFinish(0);

            LocalDateTime localDateTime = task.getCreatedAt();

            String time = localDateTime.format(DateTimeFormatter.ofPattern("yyyy-MM"));

            Integer plusPoint = 0;
            if(task.getLevel() == null){
                plusPoint = 0;
            }else if (task.getLevel() == enum_levelTask.De.getValue()){
                plusPoint = 1;
            }else if (task.getLevel() == enum_levelTask.TrungBinh.getValue()){
                plusPoint = 2;
            }else if (task.getLevel() == enum_levelTask.Kho.getValue()){
                plusPoint = 3;
            }

            List<User> listUser = task.getAssignees();
            if(listUser != null){
                for (User user : listUser) {
                    Kpi kpi =  kpiRepository.getByUserIdAndTime(user.getId(), time);

                    if (kpi != null){
                        // diem hien tai + diem task
                        kpi.setPlusPoint(kpi.getPlusPoint() + plusPoint);

                        // diem cong - diem tru
                        // lay gia tri vua set vào
                        kpi.setTotalPoint(kpi.getPlusPoint() - kpi.getMinusPoint());
                        if(kpi.getTotalPoint() >= kpi.getKpiRegistry()){
                            kpi.setStatus(enum_status_kpi.Du.getValue());
                        }
                        kpiRepository.save(kpi);
                    }
                }
            }
            taskRepository.save(task);

            Project project = task.getProject();
            Set<Task> listTask = project.getTasks();
            boolean checkFinish = true;
            for (Task t : listTask) {
                if (t.getStatus() != enum_taskStatus.IN_PROGRESS.getValue()) {
                    checkFinish = false;
                    break;
                }
            }
            if (checkFinish) {
                project.setStatus(enum_projectStatus.COMPLETED.getValue());
                projectRepository.save(project);
            }
        }
        return task;
    }

    @Transactional
    public void deleteTask(Integer taskId) {
        Task task = taskRepository.findById(taskId);
        if (task == null) {
            throw new RuntimeException("Không tìm thấy nhiệm vụ");
        }

        // Kiểm tra quyền (chỉ ADMIN của project mới được xóa)
        Project project = task.getProject();
        ProjectMemberId memberId = new ProjectMemberId(task.getCreatedBy(), project.getId());
        ProjectMember member = projectMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người tạo"));

        if (!"ADMIN".equals(member.getRole())) {
            throw new RuntimeException("Bạn không có quyền xóa nhiệm vụ này");
        }

        taskRepository.delete(task);
    }

    @Transactional
    public void assignTask(Integer taskId, Integer userId) {
        Task task = taskRepository.findById(taskId);
        if (task == null) {
            throw new RuntimeException("Không tìm thấy nhiệm vụ");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Kiểm tra quyền (chỉ ADMIN của project mới được gán nhiệm vụ)
        Project project = task.getProject();
        ProjectMemberId memberId = new ProjectMemberId(task.getCreatedBy(), project.getId());
        ProjectMember member = projectMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người tạo"));

        if (!"ADMIN".equals(member.getRole())) {
            throw new RuntimeException("Bạn không có quyền gán nhiệm vụ này");
        }

        // Kiểm tra xem người được gán có phải là thành viên của project không
        ProjectMemberId assigneeMemberId = new ProjectMemberId(userId, project.getId());
        if (!projectMemberRepository.existsById(assigneeMemberId)) {
            throw new RuntimeException("Người dùng không phải là thành viên của dự án");
        }

        // Khởi tạo danh sách assignees nếu chưa có
        if (task.getAssignees() == null) {
            task.setAssignees(new ArrayList<>());
        }

        // Kiểm tra xem người dùng đã được gán nhiệm vụ này chưa
        if (task.getAssignees().stream().anyMatch(assignee -> assignee.getId().equals(userId))) {
            throw new RuntimeException("Người dùng đã được gán nhiệm vụ này");
        }

        // Thêm người dùng vào danh sách assignees
        task.getAssignees().add(user);
        
        // Cập nhật trạng thái task thành "Đang xử lý" nếu đang ở trạng thái "Chưa được giao"
        if (task.getStatus() == 1) { // 1 là "Chưa được giao"
            task.setStatus(2); // 2 là "Đang xử lý"
        }

        taskRepository.save(task);

        // Gửi thông báo cho người được gán nhiệm vụ
        String slug = "/tasks/" + task.getId();
        notificationService.sendNotification(userId, "Bạn được gán một nhiệm vụ mới: " + task.getTitle(), slug);
    }

    @Transactional
    public Task updateTask(TaskRequest taskRequest) {
        Task task = taskRepository.findById(taskRequest.getId());

        // Kiểm tra quyền (chỉ ADMIN của project mới được cập nhật)
        Project project = task.getProject();
        ProjectMemberId memberId = new ProjectMemberId(task.getCreatedBy(), project.getId());
        ProjectMember member = projectMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người tạo"));

        if (!"ADMIN".equals(member.getRole())) {
            throw new RuntimeException("Bạn không có quyền cập nhật nhiệm vụ này");
        }

        task.setTitle(taskRequest.getTitle());
        task.setDescription(taskRequest.getDescription());
        task.setFromDate(taskRequest.getFromDate());
        task.setToDate(taskRequest.getToDate());
        task.setLevel(taskRequest.getLevel());

        return taskRepository.save(task);
    }

    public Task updateProgress(Integer taskId, Integer progress) {
        log.info("Task ID: {}", taskId);
        log.info("Progress: {}", progress);
        Task task = taskRepository.findById(taskId);
        if (task != null) {
            task.setProgress(progress);
            taskRepository.save(task);
        }
        return task;
    }
}
