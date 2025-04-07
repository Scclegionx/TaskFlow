package mobile_be.mobile_be.Mapper;

import mobile_be.mobile_be.DTO.response.KpiResponseDTO;
import mobile_be.mobile_be.DTO.response.RatingResponseDTO;
import mobile_be.mobile_be.Model.Kpi;
import mobile_be.mobile_be.Model.Rating;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RatingMapper {
    RatingMapper INSTANCE = Mappers.getMapper(RatingMapper.class);

    RatingResponseDTO toDTO(Rating rating);

    List<RatingResponseDTO> toDtoList(List<Rating> ratings); // Sửa chỗ này
}

