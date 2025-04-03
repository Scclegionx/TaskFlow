package mobile_be.mobile_be.DTO.response;

import lombok.Data;

@Data
public class InfoUserResponseDTO {
    private Integer id;
    private String name;
    private String email;
    private String gender;
    private String DateOfBirth;
    private String totalPoint; // co dang la String  : 10/1000
    private float totalHours;
    private String avatar;
}
