package mobile_be.mobile_be.DTO.response;

import lombok.Data;
import mobile_be.mobile_be.Model.Team;

import java.util.List;

@Data
public class DepartmentResponseDTO {
    private Integer id;
    private String name;
    private String description;
    private Integer leaderId;
    private Integer status; // 0: inactive, 1: active
    private String leaderName;
    private List<Team> listTeam;

}
