package mobile_be.mobile_be.DTO.response;

import lombok.Data;
import mobile_be.mobile_be.Model.User;

import java.util.List;

@Data
public class TeamResponseDTO {
    private Integer id;
    private String name;
    private String description;
    private Integer departmentId;
    private String departmentName;
    private Integer status; // 0: inactive, 1: active
    private String leaderName;
    private Integer leaderId;
    private List<User> members;
}
