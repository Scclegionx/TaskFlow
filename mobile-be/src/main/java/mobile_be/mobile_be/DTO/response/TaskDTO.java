package mobile_be.mobile_be.DTO.response;

import lombok.Data;

import java.util.List;

@Data
public class TaskDTO {
    private Integer id;
    private String title;
    private String description;
    private String status; // Trạng thái công việc
    private List<UserDTO> assignees;
}
