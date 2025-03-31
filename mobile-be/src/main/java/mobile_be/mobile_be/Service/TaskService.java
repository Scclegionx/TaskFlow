package mobile_be.mobile_be.Service;

import lombok.extern.slf4j.Slf4j;
import mobile_be.mobile_be.DTO.request.TaskRequest;
import mobile_be.mobile_be.Model.Project;
import mobile_be.mobile_be.Model.Task;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.ProjectRepository;
import mobile_be.mobile_be.Repository.TaskRepository;
import mobile_be.mobile_be.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import mobile_be.mobile_be.contains.enum_taskStatus;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Slf4j
public class TaskService {
    @Autowired
    private NotificationService notificationService;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;


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
        task.setAssignees(user);
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
        Task task = taskRepository.getTaskDetail(taskId);
        if (task.getStatus() == enum_taskStatus.IN_PROGRESS.getValue()
                && task.getToDate() != null) {
            if (task.getToDate().isBefore(LocalDateTime.now())) {
                task.setStatus(enum_taskStatus.OVERDUE.getValue());
            }
        }
        return task;
    }

}
