package mobile_be.mobile_be.Mapper;

import mobile_be.mobile_be.DTO.response.ProjectResponseDTO;
import mobile_be.mobile_be.DTO.response.UserDTO;
import mobile_be.mobile_be.DTO.response.TaskDTO;
import mobile_be.mobile_be.Model.Project;
import mobile_be.mobile_be.Model.ProjectMember;
import mobile_be.mobile_be.Model.Task;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;


@Mapper(componentModel = "spring")

public interface ProjectMapper {
    ProjectMapper INSTANCE = Mappers.getMapper(ProjectMapper.class);

    @Mapping(source = "createdBy.name", target = "createdBy")
    ProjectResponseDTO toDTO(Project project);
    default List<UserDTO> mapProjectMembers(List<ProjectMember> members) {
        return members.stream().map(m -> {
            UserDTO dto = new UserDTO();
            dto.setId(m.getUser().getId());
            dto.setName(m.getUser().getName());
            dto.setEmail(m.getUser().getEmail());
            return dto;
        }).collect(Collectors.toList());
    }

    default List<TaskDTO> mapTasks(List<Task> tasks) {
        return tasks.stream().map(t -> {
            TaskDTO dto = new TaskDTO();
            dto.setId(t.getId());
            dto.setTitle(t.getTitle());
            dto.setDescription(t.getDescription());
            dto.setStatus(t.getStatus().toString());
            dto.setToDate(t.getToDate());
            
            // Map thông tin người được assign
            if (t.getAssignees() != null && !t.getAssignees().isEmpty()) {
                List<UserDTO> assignees = t.getAssignees().stream()
                    .map(assignee -> {
                        UserDTO userDTO = new UserDTO();
                        userDTO.setId(assignee.getId());
                        userDTO.setName(assignee.getName());
                        userDTO.setAvatar(assignee.getAvatar());
                        return userDTO;
                    })
                    .collect(Collectors.toList());
                dto.setAssignees(assignees);
            } else {
                dto.setAssignees(new ArrayList<>());
            }
            
            return dto;
        }).collect(Collectors.toList());
    }

    List<ProjectResponseDTO> toDtoList(List<Project> projects);
}
