package mobile_be.mobile_be.DTO.request;

import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.Data;

import java.util.List;

@Data
public class TeamRequestDTO {
    private Integer id;
    private String name;
    private String description;
    private Integer departmentId;
    private Integer teamLeaderId;

}
