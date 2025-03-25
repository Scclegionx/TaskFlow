package mobile_be.mobile_be.Mapper;

import mobile_be.mobile_be.DTO.response.ProjectResponseDTO;
import mobile_be.mobile_be.DTO.response.UserResponseDTO;
import mobile_be.mobile_be.Model.Project;
import mobile_be.mobile_be.Model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")

public interface UserMapper {
    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);


    UserResponseDTO toDTO(User user);

    List<UserResponseDTO> toDtoList(List<User> users);
}
