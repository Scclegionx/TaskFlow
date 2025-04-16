package mobile_be.mobile_be.DTO.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Data
public class TaskDTO {
    private Integer id;
    private String title;
    private String description;
    private String status; // Trạng thái công việc
    private LocalDateTime toDate;
    private List<UserDTO> assignees;
}
