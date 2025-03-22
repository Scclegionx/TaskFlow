package mobile_be.mobile_be.DTO.response;

import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class ProjectResponseDTO {
    private Integer id;
    private String name;
    private String description;
    private String createdBy;
    private Integer status;
    private Date fromDate;
    private Date toDate;
    private List<UserDTO> members; // Danh sách thành viên
    private List<TaskDTO> tasks;
}
