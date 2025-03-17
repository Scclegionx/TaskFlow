package mobile_be.mobile_be.Service;

import mobile_be.mobile_be.DTO.CreateProjectRequest;
import mobile_be.mobile_be.Model.Project;
import mobile_be.mobile_be.Model.ProjectMember;
import mobile_be.mobile_be.Model.ProjectMemberId;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.ProjectMemberRepository;
import mobile_be.mobile_be.Repository.ProjectRepository;
import mobile_be.mobile_be.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final NotificationService notificationService;

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
}
