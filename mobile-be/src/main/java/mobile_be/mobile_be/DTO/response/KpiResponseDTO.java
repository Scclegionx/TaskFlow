package mobile_be.mobile_be.DTO.response;

import lombok.Data;

import java.time.LocalDate;

@Data
public class KpiResponseDTO {
    private Integer id;
    private Integer userId;
    private Integer kpiRegistry;
    private Integer totalPoint;
    private Integer plusPoint;
    private Integer minusPoint;
    private Integer status;
    private LocalDate time;
    private String userName;

}
