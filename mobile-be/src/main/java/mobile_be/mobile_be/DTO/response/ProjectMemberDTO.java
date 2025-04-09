package mobile_be.mobile_be.DTO.response;

import lombok.Data;

@Data
public class ProjectMemberDTO {
    private Integer id;
    private String name;
    private String email;
    private String role;  // Thêm trường role
    private String avatar;
} 