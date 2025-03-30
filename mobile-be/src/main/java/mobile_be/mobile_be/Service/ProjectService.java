package mobile_be.mobile_be.Service;

import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.extern.slf4j.Slf4j;
import mobile_be.mobile_be.DTO.CreateProjectRequest;
import mobile_be.mobile_be.DTO.response.ProjectResponseDTO;
import mobile_be.mobile_be.DTO.response.TaskResponseDTO;
import mobile_be.mobile_be.DTO.response.UserResponseDTO;
import mobile_be.mobile_be.Mapper.ProjectMapper;
import mobile_be.mobile_be.Mapper.TaskMapper;
import mobile_be.mobile_be.Mapper.UserMapper;
import mobile_be.mobile_be.Model.*;
import mobile_be.mobile_be.Repository.ProjectMemberRepository;
import mobile_be.mobile_be.Repository.ProjectRepository;
import mobile_be.mobile_be.Repository.UserRepository;
import mobile_be.mobile_be.Exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mobile_be.mobile_be.contains.enum_projectAndTaskType;

import mobile_be.mobile_be.contains.enum_taskStatus;


import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final NotificationService notificationService;

    @Autowired
    private ProjectMapper projectMapper;
    @Autowired
    private TaskMapper taskMapper;
    @Autowired
    private UserMapper userMapper;

    @Transactional
    public Project createProject(CreateProjectRequest request) {
        User creator = userRepository.findById(request.getCreatedBy().intValue())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setCreatedBy(creator);
        Project savedProject = projectRepository.save(project);

        Set<ProjectMember> members = request.getUserIds().stream()
                .map(userId -> {
                    User user = userRepository.findById(userId.intValue())
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    ProjectMember member = new ProjectMember();
                    member.setId(new ProjectMemberId(user.getId(), savedProject.getId().intValue()));
                    member.setUser(user);
                    member.setProject(savedProject);
                    member.setRole("member");
                    return member;
                })
                .collect(Collectors.toSet());

        projectMemberRepository.saveAll(members);
        String slug = "/projects"+"/"+project.getId();

        // Gửi thông báo cho tất cả thành viên mới
        for (User member : members.stream().map(ProjectMember::getUser).collect(Collectors.toList())) {
            notificationService.sendNotification(member.getId(),
                    "Bạn đã được thêm vào dự án: " + savedProject.getName(),slug);
        }

        return savedProject;
    }

    public Map<String, Integer> getNumberProjectAndTask() {
        List<Object[]> result = projectRepository.getNumberProjectAndTask();

        if (!result.isEmpty()) {
            Object[] row = result.get(0);
            Map<String, Integer> totals = new HashMap<>();
            totals.put("projects", ((Number) row[0]).intValue());
            totals.put("tasks", ((Number) row[1]).intValue());
            totals.put("users", ((Number) row[2]).intValue());
            return totals;
        }
        return Collections.emptyMap();
    }

    public  Map<String, Integer> getNumberProjectByStatus(Integer projectId, Integer type, Integer userId) {
        List<Object[]> result = new ArrayList<>();
        if (type == null){
            result = projectRepository.getNumberProjectByStatus(projectId);
        }else if (type == 0){
            result = projectRepository.getNumberProjectByStatusGiao(projectId, userId);
        }else if (type == 1){
            result = projectRepository.getNumberProjectByStatusDuocGiao(projectId, userId);
        }

        if (!result.isEmpty()) {
            Object[] row = result.get(0);
            Map<String, Integer> totals = new HashMap<>();
            totals.put("finished", ((Number) row[0]).intValue());
            totals.put("processing", ((Number) row[1]).intValue());
            totals.put("overdue", ((Number) row[2]).intValue());
            Integer total = ((Number) row[0]).intValue() + ((Number) row[1]).intValue() + ((Number) row[2]).intValue();
            totals.put("total", total);
            return totals;
        }
        return Collections.emptyMap();
    }

    public List<ProjectResponseDTO> getAllProject(String name, Integer projectId) {
        List<Project> projects = projectRepository.getAllProject(name,projectId);
        return projects.stream().map(project -> {

            // lay ra tong so cong viec trong tung du an
            int totalTask = projectRepository.findAllTaskInProject(project.getId());
            // lay so luong cong viec da hoan thanh
            int totalTaskFinished = projectRepository.totalTaskFinishInProject(project.getId());

            // tinh theo phan tram
            int progress = totalTask == 0 ? 0 : (totalTaskFinished * 100) / totalTask;
            ProjectResponseDTO dto = projectMapper.toDTO(project);
            dto.setProgress(progress);
            return dto;
        }).collect(Collectors.toList());

    }





    public List<TaskResponseDTO> getAllTaskInProject(Integer projectId, Integer userId, Integer type, String textSearch) {

        List<Task> results = new ArrayList<>();
        if(type == null){
            results = projectRepository.getAllTaskInProject(projectId, textSearch);
        }else if (type == enum_projectAndTaskType.Giao.getValue()){
            results = projectRepository.getAllTaskInProjectGiao(projectId, userId, textSearch);
        }else if (type == enum_projectAndTaskType.DuocGiao.getValue()){
            results = projectRepository.getAllTaskInProjectDuocGiao(projectId, userId, textSearch);
        }

        return results.stream().map(task -> {
            TaskResponseDTO dto = taskMapper.toDTO(task);

            if(task.getCreatedBy() != null){
                User user = userRepository.findById(task.getCreatedBy()).orElse(null);
                if (user != null){
                    dto.setNameCreatedBy(user.getName());
                }
            }

            // xu ly qua han
            if (task.getStatus() == enum_taskStatus.IN_PROGRESS.getValue()){
                LocalDateTime currentDate = LocalDateTime.now();
                if (task.getToDate() != null && currentDate.isAfter(task.getToDate())) {
                    dto.setStatus(enum_taskStatus.OVERDUE.getValue());
                }
            }

            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public List<UserResponseDTO> getAllMemberInProject(Integer projectId, String textSearch) {
        List<User> results = projectRepository.getAllMemberInProject(projectId, textSearch);
        return results.stream().map(user -> {
                            UserResponseDTO dto = userMapper.toDTO(user);
                           return dto;
        }).collect(Collectors.toList());
    }
    @Transactional
    public List<ProjectResponseDTO> getProject() {
        List<Project> projects = projectRepository.findAll();
        return projects.stream()
                .map(project -> {
                    ProjectResponseDTO dto = new ProjectResponseDTO();
                    dto.setId(project.getId());
                    dto.setName(project.getName());
                    dto.setDescription(project.getDescription());
                    dto.setCreatedBy(project.getCreatedBy() != null ? project.getCreatedBy().getName() : null);
                    dto.setStatus(project.getStatus());
                    dto.setFromDate(project.getFromDate());
                    dto.setToDate(project.getToDate());
                    dto.setMembers(null); // Không lấy members
                    dto.setTasks(null);   // Không lấy tasks
                    return dto;
                })
                .collect(Collectors.toList());
    }
    @Transactional
    public ProjectResponseDTO getProjectById(Integer id) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        ProjectResponseDTO dto = projectMapper.toDTO(project);
        dto.setMembers(projectMapper.mapProjectMembers(new ArrayList<>(project.getProjectMembers())));
        dto.setTasks(projectMapper.mapTasks(new ArrayList<>(project.getTasks())));

        return dto;
    }

}
