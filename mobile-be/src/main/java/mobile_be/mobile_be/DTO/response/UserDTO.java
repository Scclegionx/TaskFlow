package mobile_be.mobile_be.DTO.response;

import lombok.Data;
import java.time.LocalDate;

@Data
public class UserDTO {
    private Integer id;
    private String name;
    private String email;
    private Integer gender;
    private String phoneNumber;
    private LocalDate dateOfBirth;
}
