package mobile_be.mobile_be.DTO.response;

import lombok.Data;

@Data
public class TaskDTO {
    private Integer id;
    private String title;
    private String description;
    private String status; // Trạng thái công việc
}
