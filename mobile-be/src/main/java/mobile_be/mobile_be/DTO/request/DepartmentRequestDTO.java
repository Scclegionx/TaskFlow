package mobile_be.mobile_be.DTO.request;

import lombok.Data;

@Data
public class DepartmentRequestDTO {
    private Integer id;
    private String name;
    private String description;
    private Integer leaderId;

}
