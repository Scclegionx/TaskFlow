package mobile_be.mobile_be.Mapper;

import mobile_be.mobile_be.DTO.response.CommentResponseDTO;
import mobile_be.mobile_be.DTO.response.KpiResponseDTO;
import mobile_be.mobile_be.Model.Comment;
import mobile_be.mobile_be.Model.Kpi;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")

public interface CommentMapper {
    CommentMapper INSTANCE = Mappers.getMapper(CommentMapper.class);


    CommentResponseDTO toDTO(Comment comment);

    List<CommentResponseDTO> toDtoList(List<Comment> comments);
}
