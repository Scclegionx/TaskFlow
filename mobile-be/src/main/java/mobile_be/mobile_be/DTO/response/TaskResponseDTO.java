package mobile_be.mobile_be.DTO.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Data
public class TaskResponseDTO {
    private Integer id;
    private String title;
    private String description;
    private String project;
    private List<String> assignees;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;
    private Integer status;
    private String nameCreatedBy;
    private Integer waitFinish;

}
