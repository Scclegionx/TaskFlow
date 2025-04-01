package mobile_be.mobile_be.Mapper;

import mobile_be.mobile_be.DTO.response.KpiResponseDTO;
import mobile_be.mobile_be.DTO.response.UserResponseDTO;
import mobile_be.mobile_be.Model.Kpi;
import mobile_be.mobile_be.Model.User;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")

public interface KpiMapper {
    KpiMapper INSTANCE = Mappers.getMapper(KpiMapper.class);


    KpiResponseDTO toDTO(Kpi kpi);

    List<KpiResponseDTO> toDtoList(List<Kpi> kpis);
}
