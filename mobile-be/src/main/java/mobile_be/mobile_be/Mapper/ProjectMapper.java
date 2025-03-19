package mobile_be.mobile_be.Mapper;

import mobile_be.mobile_be.DTO.response.ProjectResponseDTO;
import mobile_be.mobile_be.Model.Project;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import java.util.List;

@Mapper(componentModel = "spring")

public interface ProjectMapper {
    ProjectMapper INSTANCE = Mappers.getMapper(ProjectMapper.class);

    @Mapping(source = "createdBy.name", target = "createdBy")
    ProjectResponseDTO toDTO(Project project);

    List<ProjectResponseDTO> toDtoList(List<Project> projects);
}
