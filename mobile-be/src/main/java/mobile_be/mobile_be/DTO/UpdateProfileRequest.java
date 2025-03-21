package mobile_be.mobile_be.DTO;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String email;
    private String password;
}
