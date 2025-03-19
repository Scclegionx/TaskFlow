package mobile_be.mobile_be.Service;

import lombok.extern.slf4j.Slf4j;
import mobile_be.mobile_be.DTO.CreateProjectRequest;
import mobile_be.mobile_be.DTO.response.ProjectResponseDTO;
import mobile_be.mobile_be.Mapper.ProjectMapper;
import mobile_be.mobile_be.Model.Project;
import mobile_be.mobile_be.Model.ProjectMember;
import mobile_be.mobile_be.Model.ProjectMemberId;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.ProjectMemberRepository;
import mobile_be.mobile_be.Repository.ProjectRepository;
import mobile_be.mobile_be.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        // Gửi thông báo cho tất cả thành viên mới
        for (User member : members.stream().map(ProjectMember::getUser).collect(Collectors.toList())) {
            notificationService.sendNotification(member.getId(),
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

    public  Map<String, Integer> getNumberProjectByStatus(){
        List<Object[]> result = projectRepository.getNumberProjectByStatus();
        log.info("result: " + result);
        if (!result.isEmpty()) {
            Object[] row = result.get(0);
            Map<String, Integer> totals = new HashMap<>();
            totals.put("finished", ((Number) row[0]).intValue());
            totals.put("processing", ((Number) row[1]).intValue());
            totals.put("overdue", ((Number) row[2]).intValue());
            return totals;
        }
        return Collections.emptyMap();
    }

    public List<ProjectResponseDTO> getAllProject() {
        List<Project> projects = projectRepository.findAll();
        log.info("ket qua nhan duoc" + projects.get(0).getName());
        return projectMapper.toDtoList(projects);

    }


}
