package mobile_be.mobile_be.DTO.request;

import lombok.Data;
import java.util.Date;

@Data
public class UpdateProjectRequest {
    private String name;
    private String description;
    private Integer status;
    private Date fromDate;
    private Date toDate;
}
