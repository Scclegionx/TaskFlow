package mobile_be.mobile_be.DTO.response;

import lombok.Data;

import java.util.Date;

@Data
public class ProjectResponseDTO {
    private String name;
    private String description;
    private String createdBy;
    private Integer status;
    private Date fromDate;
    private Date toDate;
    // tien do, lay so nguyen cho de ve bieu do
    private Integer progress;
}
