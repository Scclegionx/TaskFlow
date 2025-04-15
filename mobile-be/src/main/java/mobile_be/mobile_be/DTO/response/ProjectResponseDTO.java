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
    private Date createdAt;
    private List<ProjectMemberDTO> members; // Thay đổi kiểu từ UserDTO sang ProjectMemberDTO
    private List<TaskDTO> tasks;
    // tien do, lay so nguyen cho de ve bieu do
    private Integer progress;
    private Integer memberNumber;
    private Integer totalMembers;
    private Integer totalTasks;
    private Integer memberPage;
    private Integer memberSize;
    private Integer taskPage;
    private Integer taskSize;
}
