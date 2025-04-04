package mobile_be.mobile_be.DTO;

import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class CreateProjectRequest {
    private String name;
    private String description;
    private Integer createdBy;
    private List<Integer> userIds;
    private Date fromDate;
    private Date toDate;
}
