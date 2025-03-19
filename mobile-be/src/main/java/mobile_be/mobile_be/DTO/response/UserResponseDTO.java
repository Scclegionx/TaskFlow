package mobile_be.mobile_be.DTO.response;


import lombok.Data;

@Data
public class UserResponseDTO {
    private String name;
    private String email;
    private boolean isActive;

}
