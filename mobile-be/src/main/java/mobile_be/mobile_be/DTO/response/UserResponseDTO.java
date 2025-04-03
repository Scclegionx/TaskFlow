package mobile_be.mobile_be.DTO.response;


import lombok.Data;

@Data
public class UserResponseDTO {
    private Integer id;
    private String name;
    private String email;
    private boolean isActive;

}
