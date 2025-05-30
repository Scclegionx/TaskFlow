package mobile_be.mobile_be.Service;

import com.cloudinary.api.exceptions.BadRequest;
import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.extern.slf4j.Slf4j;
import mobile_be.mobile_be.DTO.CreateProjectRequest;
import mobile_be.mobile_be.DTO.response.*;
import mobile_be.mobile_be.DTO.request.UpdateProjectRequest;
import mobile_be.mobile_be.Mapper.ProjectMapper;
import mobile_be.mobile_be.Mapper.TaskMapper;
import mobile_be.mobile_be.Mapper.UserMapper;
import mobile_be.mobile_be.Model.*;
import mobile_be.mobile_be.Repository.ProjectMemberRepository;
import mobile_be.mobile_be.Repository.ProjectRepository;
import mobile_be.mobile_be.Repository.TaskRepository;
import mobile_be.mobile_be.Repository.UserRepository;
import mobile_be.mobile_be.Exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;

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
    private final EntityManager entityManager;

    @Autowired
    private ProjectMapper projectMapper;
    @Autowired
    private TaskMapper taskMapper;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private MailService mailService;

    @Transactional
    public Project createProject(CreateProjectRequest request) {
        User creator = userRepository.findById(request.getCreatedBy().intValue())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setCreatedBy(creator);
        project.setFromDate(request.getFromDate());
        project.setToDate(request.getToDate());
        project.setCreatedAt(new Date());
        project.setStatus(0);
        Project savedProject = projectRepository.save(project);

        // Tạo Set để lưu tất cả thành viên
        Set<ProjectMember> members = new HashSet<>();

        // Thêm người tạo project với role ADMIN
        ProjectMember creatorMember = new ProjectMember();
        creatorMember.setId(new ProjectMemberId(creator.getId(), savedProject.getId()));
        creatorMember.setUser(creator);
        creatorMember.setProject(savedProject);
        creatorMember.setRole("ADMIN");
        members.add(creatorMember);

        // Thêm các thành viên khác với role MEMBER
        request.getUserIds().stream()
                .filter(userId -> !userId.equals(request.getCreatedBy())) // Lọc bỏ creator vì đã thêm ở trên
                .forEach(userId -> {
                    User user = userRepository.findById(userId.intValue())
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    ProjectMember member = new ProjectMember();
                    member.setId(new ProjectMemberId(user.getId(), savedProject.getId()));
                    member.setUser(user);
                    member.setProject(savedProject);
                    member.setRole("MEMBER");
                    members.add(member);
                });

        projectMemberRepository.saveAll(members);
        String slug = "/projects/" + project.getId();

        // Gửi thông báo cho tất cả thành viên mới
        for (User member : members.stream().map(ProjectMember::getUser).collect(Collectors.toList())) {
            notificationService.sendNotification(member.getId(),
                    "Bạn đã được thêm vào dự án: " + savedProject.getName(),slug);
            mailService.sendNoticeEmail(member.getEmail(),
                    "Thông báo dự án mới",
                    "Bạn đã được thêm vào dự án: " + savedProject.getName());
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
            totals.put("pending", ((Number) row[3]).intValue());
            Integer total = ((Number) row[0]).intValue() + ((Number) row[1]).intValue() + ((Number) row[2]).intValue() + ((Number) row[3]).intValue();
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
            } else if (task.getStatus() == enum_taskStatus.OVERDUE.getValue()){
                dto.setStatus(enum_taskStatus.OVERDUE.getValue());
            }

            return dto;
        }).collect(Collectors.toList());
    }


    public List<TaskResponseDTO> getTaskPending(Integer projectId, Integer userId, Integer type, String textSearch) {

        List<Task> results = new ArrayList<>();
        if(type == null){
            results = projectRepository.getAllTaskPending(projectId,userId, textSearch);
        }else if (type == 0 ){
            // chờ nhận
            results = projectRepository.getAllTaskPendingNhan(projectId, userId, textSearch);
        }else if (type ==  1){
            //chờ xác nhận hoàn thành
            results = projectRepository.getAllTaskPendingDuyetHoanThanh(projectId, userId, textSearch);
        }

        return results.stream().map(task -> {
            TaskResponseDTO dto = taskMapper.toDTO(task);

            if(task.getCreatedBy() != null){
                User user = userRepository.findById(task.getCreatedBy()).orElse(null);
                if (user != null){
                    dto.setNameCreatedBy(user.getName());
                }
            }

            return dto;
        }).collect(Collectors.toList());
    }



    public List<TaskResponseDTO> getMyTask(Integer projectId, Integer userId, Integer type, String textSearch) {

        List<Task> results = new ArrayList<>();

        results = projectRepository.getMyTask(projectId,userId, textSearch);

        // lay all
        if (type == null){
            return results.stream().map(task -> {
                TaskResponseDTO dto = taskMapper.toDTO(task);

                if(task.getCreatedBy() != null){
                    User user = userRepository.findById(task.getCreatedBy()).orElse(null);
                    if (user != null){
                        dto.setNameCreatedBy(user.getName());
                    }
                }

                return dto;
            }).collect(Collectors.toList());
        }

        if (type == enum_taskStatus.IN_PROGRESS.getValue()){
            return results.stream()
                    .filter(task -> task.getStatus() == enum_taskStatus.IN_PROGRESS.getValue())
                    .map(task -> {
                TaskResponseDTO dto = taskMapper.toDTO(task);

                if(task.getCreatedBy() != null){
                    User user = userRepository.findById(task.getCreatedBy()).orElse(null);
                    if (user != null){
                        dto.setNameCreatedBy(user.getName());
                    }
                }

                return dto;
            }).collect(Collectors.toList());
        }

        if (type == enum_taskStatus.COMPLETED.getValue()){
            return results.stream()
                    .filter(task -> task.getStatus() == enum_taskStatus.COMPLETED.getValue())
                    .map(task -> {
                        TaskResponseDTO dto = taskMapper.toDTO(task);

                        if(task.getCreatedBy() != null){
                            User user = userRepository.findById(task.getCreatedBy()).orElse(null);
                            if (user != null){
                                dto.setNameCreatedBy(user.getName());
                            }
                        }

                        return dto;
                    }).collect(Collectors.toList());
        }

        if (type == enum_taskStatus.OVERDUE.getValue()){
            LocalDateTime currentDate = LocalDateTime.now();
            return results.stream()
                    .filter(task ->
                            (task.getStatus() == enum_taskStatus.IN_PROGRESS.getValue() &&
                                    task.getToDate() != null &&
                                    currentDate.isAfter(task.getToDate())) || (task.getStatus() == enum_taskStatus.OVERDUE.getValue())
                    )
                    .map(task -> {
                        TaskResponseDTO dto = taskMapper.toDTO(task);

                        if(task.getCreatedBy() != null){
                            User user = userRepository.findById(task.getCreatedBy()).orElse(null);
                            if (user != null){
                                dto.setNameCreatedBy(user.getName());
                            }
                            dto.setStatus(enum_taskStatus.OVERDUE.getValue());
                        }

                        return dto;
                    }).collect(Collectors.toList());
        }

        if (type == enum_taskStatus.CANCELLED.getValue()){
            return results.stream()
                    .filter(task -> task.getStatus() == enum_taskStatus.CANCELLED.getValue())
                    .map(task -> {
                        TaskResponseDTO dto = taskMapper.toDTO(task);

                        if(task.getCreatedBy() != null){
                            User user = userRepository.findById(task.getCreatedBy()).orElse(null);
                            if (user != null){
                                dto.setNameCreatedBy(user.getName());
                            }
                        }

                        return dto;
                    }).collect(Collectors.toList());
        }


        // return all
        return null;
    }


    @Transactional
    public Task acceptTask(Integer taskId, Integer userId) {
        try {
            Task task = taskRepository.getTaskDetail(taskId);

            // Cập nhật trạng thái công việc
            task.setStatus(enum_taskStatus.IN_PROGRESS.getValue());
            task.setWaitFinish(0);
            task.setProgress(0);
            return taskRepository.save(task);
        }catch(Exception e)
        {
            throw new RuntimeException("Có lỗi xảy ra khi cập nhật trạng thái công việc: " + e.getMessage());
        }
    }


    @Transactional
    public List<UserResponseDTO> getAllMemberInProject(Integer projectId, String textSearch) {
        List<User> results = projectRepository.getAllMemberInProject(projectId, textSearch);
        return results.stream().map(user -> {
                            UserResponseDTO dto = userMapper.toDTO(user);
                            dto.setAvatar(user.getAvatar());
                           return dto;
        }).collect(Collectors.toList());
    }
    @Transactional
    public Page<ProjectResponseDTO> getProject(Integer userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Page<Project> projects;
        if (userId != null) {
            projects = projectRepository.findByProjectMembersUserId(userId, pageable);
        } else {
            projects = projectRepository.findAll(pageable);
        }
        
        // Lấy ngày hiện tại để so sánh
        Date currentDate = new Date();
        
        // Cập nhật trạng thái dự án dựa trên ngày bắt đầu và ngày kết thúc
        List<Project> updatedProjects = new ArrayList<>();
        for (Project project : projects.getContent()) {
            // Bỏ qua việc kiểm tra nếu dự án đã hoàn thành (2) hoặc bị hủy (3)
            if (project.getStatus() == 2 || project.getStatus() == 3) {
                continue;
            }
            
            boolean isUpdated = false;
            
            // Nếu đã đến ngày bắt đầu, chuyển trạng thái từ 0 (chưa bắt đầu) sang 1 (đang thực hiện)
            if (project.getFromDate() != null && project.getFromDate().before(currentDate) && project.getStatus() == 0) {
                project.setStatus(1);
                isUpdated = true;
            }
            
            // Nếu đã quá ngày kết thúc, chuyển trạng thái sang 4 (quá hạn)
            if (project.getToDate() != null && currentDate.after(project.getToDate()) && project.getStatus() != 2) {
                project.setStatus(4);
                isUpdated = true;
            }
            
            // Lưu dự án đã cập nhật
            if (isUpdated) {
                updatedProjects.add(project);
            }
        }
        
        // Lưu các dự án đã cập nhật vào database
        if (!updatedProjects.isEmpty()) {
            projectRepository.saveAll(updatedProjects);
        }
        
        return projects.map(project -> {
            ProjectResponseDTO dto = new ProjectResponseDTO();
            dto.setId(project.getId());
            dto.setName(project.getName());
            dto.setDescription(project.getDescription());
            dto.setCreatedBy(project.getCreatedBy() != null ? project.getCreatedBy().getName() : null);
            dto.setStatus(project.getStatus());
            dto.setFromDate(project.getFromDate());
            dto.setToDate(project.getToDate());
            dto.setCreatedAt(project.getCreatedAt());
            
            // Tính progress
            int totalTask = projectRepository.findAllTaskInProject(project.getId());
            int totalTaskFinished = projectRepository.totalTaskFinishInProject(project.getId());
            int progress = totalTask == 0 ? 0 : (totalTaskFinished * 100) / totalTask;
            dto.setProgress(progress);
            
            // Lấy số lượng thành viên
            int memberNumber = projectRepository.countMembersByProjectId(project.getId());
            dto.setMemberNumber(memberNumber);
            
            return dto;
        });
    }
    @Transactional
    public ProjectResponseDTO getProjectById(Integer id, Integer memberPage, Integer memberSize, Integer taskPage, Integer taskSize) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));

        ProjectResponseDTO dto = new ProjectResponseDTO();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setCreatedBy(project.getCreatedBy().getName());
        dto.setStatus(project.getStatus());
        dto.setFromDate(project.getFromDate());
        dto.setToDate(project.getToDate());
        
        // Lấy tổng số thành viên và công việc
        int totalMembers = projectRepository.countMembersByProjectId(id);
        int totalTasks = projectRepository.findAllTaskInProject(id);
        dto.setTotalMembers(totalMembers);
        dto.setTotalTasks(totalTasks);
        
        // Set thông tin phân trang
        dto.setMemberPage(memberPage);
        dto.setMemberSize(memberSize);
        dto.setTaskPage(taskPage);
        dto.setTaskSize(taskSize);
        
        // Lấy danh sách thành viên với phân trang và sắp xếp theo tên
        List<ProjectMember> members = project.getProjectMembers().stream()
                .sorted((a, b) -> a.getUser().getName().compareToIgnoreCase(b.getUser().getName()))
                .skip(memberPage * memberSize)
                .limit(memberSize)
                .collect(Collectors.toList());
                
        // Map members với role
        List<ProjectMemberDTO> memberDTOs = members.stream()
                .map(pm -> {
                    ProjectMemberDTO memberDTO = new ProjectMemberDTO();
                    memberDTO.setId(pm.getUser().getId());
                    memberDTO.setName(pm.getUser().getName());
                    memberDTO.setEmail(pm.getUser().getEmail());
                    memberDTO.setRole(pm.getRole());
                    memberDTO.setAvatar(pm.getUser().getAvatar());
                    return memberDTO;
                })
                .collect(Collectors.toList());
        dto.setMembers(memberDTOs);

        // Lấy danh sách công việc với phân trang và sắp xếp theo createdAt
        List<Task> tasks = project.getTasks().stream()
                .filter(task -> task.getParentId() == null)
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .skip(taskPage * taskSize)
                .limit(taskSize)
                .collect(Collectors.toList());
                
        // Map tasks với assignees
        dto.setTasks(projectMapper.mapTasks(tasks));

        return dto;
    }

    public ProjectResponseDTO updateProject(Integer projectId, UpdateProjectRequest request, Integer userId) 
            throws IllegalAccessException {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));

        // Kiểm tra quyền
        if (!project.getCreatedBy().getId().equals(userId)) {
            throw new IllegalAccessException("Bạn không có quyền sửa dự án này");
        }

        // Cập nhật thông tin
        if (request.getName() != null) {
            project.setName(request.getName());
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }
        if (request.getFromDate() != null) {
            project.setFromDate(request.getFromDate());
        }
        if (request.getToDate() != null) {
            project.setToDate(request.getToDate());
        }

        Project updatedProject = projectRepository.save(project);
        return convertToProjectResponseDTO(updatedProject);
    }

    @Transactional
    public void deleteProject(Integer projectId, Integer userId) throws IllegalAccessException {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));

        // Kiểm tra quyền
        if (!project.getCreatedBy().getId().equals(userId)) {
            throw new IllegalAccessException("Bạn không có quyền xóa dự án này");
        }

        try {
            // Xóa project và các bản ghi liên quan
            projectRepository.delete(project);
            projectRepository.flush(); // Đảm bảo thay đổi được đẩy xuống DB ngay lập tức
        } catch (Exception e) {
            throw new RuntimeException("Có lỗi xảy ra khi xóa dự án: " + e.getMessage());
        }
    }

    private ProjectResponseDTO convertToProjectResponseDTO(Project project) {
        // Implement chuyển đổi từ Project sang ProjectResponseDTO
        ProjectResponseDTO dto = new ProjectResponseDTO();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setStatus(project.getStatus());
        dto.setFromDate(project.getFromDate());
        dto.setToDate(project.getToDate());
        // Set các trường khác nếu cần
        return dto;
    }

    @Transactional
    public void addProjectMember(Integer projectId, Integer userId) throws IllegalAccessException {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Kiểm tra xem người dùng đã là thành viên chưa
        boolean isMemberExists = project.getProjectMembers().stream()
                .anyMatch(pm -> pm.getUser().getId().equals(userId));
        
        if (isMemberExists) {
            throw new RuntimeException("Người dùng đã là thành viên của dự án");
        }

        // Tạo ProjectMember mới
        ProjectMember newMember = new ProjectMember();
        ProjectMemberId id = new ProjectMemberId(userId, projectId);
        newMember.setId(id);
        newMember.setProject(project);
        newMember.setUser(user);
        newMember.setRole("MEMBER"); // Mặc định role là MEMBER

        projectMemberRepository.save(newMember);
    }

    @Transactional
    public void removeProjectMember(Integer projectId, Integer memberId, Integer currentUserId) throws IllegalAccessException {
        System.out.println("=== Bắt đầu xóa thành viên ===");
        
        // Kiểm tra dự án tồn tại
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));

        // Kiểm tra quyền của người thực hiện
        ProjectMemberId currentUserMemberId = new ProjectMemberId(currentUserId, projectId);
        ProjectMember currentUserMember = projectMemberRepository.findById(currentUserMemberId)
                .orElseThrow(() -> new RuntimeException("Bạn không phải là thành viên của dự án"));

        if (!"ADMIN".equals(currentUserMember.getRole())) {
            throw new IllegalAccessException("Bạn không có quyền xóa thành viên");
        }

        // Kiểm tra không xóa người tạo dự án
        if (project.getCreatedBy().getId().equals(memberId)) {
            throw new RuntimeException("Không thể xóa người tạo dự án");
        }

        ProjectMemberId memberToRemoveId = new ProjectMemberId(memberId, projectId);
        
        ProjectMember memberToRemove = projectMemberRepository.findById(memberToRemoveId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thành viên trong dự án"));

        System.out.println("=== Chi tiết thành viên cần xóa ===");
        System.out.println("ID: userId=" + memberToRemove.getId().getUserId() 
            + ", projectId=" + memberToRemove.getId().getProjectId());
        System.out.println("Role: " + memberToRemove.getRole());
        System.out.println("User: " + (memberToRemove.getUser() != null ? memberToRemove.getUser().getName() : "null"));
        System.out.println("Project: " + (memberToRemove.getProject() != null ? memberToRemove.getProject().getName() : "null"));

        try {
            // Xóa thành viên khỏi danh sách trong Project
            project.getProjectMembers().remove(memberToRemove);
            
            // Xóa thành viên trực tiếp
            projectMemberRepository.delete(memberToRemove);
            
            // Flush để đảm bảo thay đổi được lưu xuống database
            projectMemberRepository.flush();
            entityManager.clear();
            
            System.out.println("=== Xóa thành viên thành công ===");
        } catch (Exception e) {
            System.err.println("Lỗi khi xóa thành viên: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi xóa thành viên: " + e.getMessage());
        }
    }

    public List<Map<String, Object>> searchProjects(String query) {
        List<Project> projects = projectRepository.searchProjects(query);
        return projects.stream().map(project -> {
            Map<String, Object> result = new HashMap<>();
            result.put("id", project.getId());
            result.put("name", project.getName());
            return result;
        }).collect(Collectors.toList());
    }

    @Transactional
    public List<UserResponseDTO> searchMembersInProject(Integer projectId, String searchText) {
        List<User> users = projectRepository.searchMembersInProject(projectId, searchText);
        return users.stream()
                .map(user -> {
                    UserResponseDTO dto = userMapper.toDTO(user);
                    dto.setAvatar(user.getAvatar());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public List<TaskResponseDTO> searchTasksInProject(Integer projectId, String searchText) {
        List<Task> tasks = projectRepository.searchTasksInProject(projectId, searchText);
        return tasks.stream()
                .map(task -> {
                    TaskResponseDTO dto = taskMapper.toDTO(task);
                    if(task.getCreatedBy() != null) {
                        User user = userRepository.findById(task.getCreatedBy()).orElse(null);
                        if(user != null) {
                            dto.setNameCreatedBy(user.getName());
                        }
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public List<UserResponseDTO> getProjectMembers(Integer projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dự án"));
        
        return project.getProjectMembers().stream()
//                .filter(member -> !"ADMIN".equals(member.getRole()))
                .map(member -> {
                    UserResponseDTO dto = userMapper.toDTO(member.getUser());
                    dto.setRole(member.getRole());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
