package mobile_be.mobile_be.Mapper;

import mobile_be.mobile_be.DTO.response.ProjectResponseDTO;
import mobile_be.mobile_be.DTO.response.TaskResponseDTO;
import mobile_be.mobile_be.Model.Project;
import mobile_be.mobile_be.Model.Task;
import mobile_be.mobile_be.Model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")

public interface TaskMapper {
    TaskMapper INSTANCE = Mappers.getMapper(TaskMapper.class);

    @Mapping(source = "id", target = "id")
    @Mapping(source = "project.name", target = "project")
    @Mapping(source = "assignees", target = "assignees", qualifiedByName = "mapAssignees")
    TaskResponseDTO toDTO(Task task);

    List<TaskResponseDTO> toDtoList(List<Task> tasks);

    @org.mapstruct.Named("mapAssignees")
    static List<String> mapAssignees(List<User> assignees) {
        if (assignees == null || assignees.isEmpty()) {
            return List.of();
        }
        return assignees.stream()
                .map(User::getName)
                .collect(Collectors.toList());
    }
}
