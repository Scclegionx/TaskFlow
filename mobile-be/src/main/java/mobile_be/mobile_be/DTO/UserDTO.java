package mobile_be.mobile_be.DTO;

import lombok.Data;
import mobile_be.mobile_be.Model.User;
import java.util.Set;
import java.util.stream.Collectors;
import java.time.LocalDate;

@Data
public class UserDTO {
    private Integer id;
    private String name;
    private String email;
    private Integer gender;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private boolean active;
    private Set<String> roles;

    private String avatar;

    // Constructor nhận User
    public UserDTO(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.active = user.isActive();
        this.avatar = user.getAvatar();
        this.roles = user.getRoles().stream()
                         .map(role -> role.getName().toString())
                         .collect(Collectors.toSet());
    }

    public UserDTO() {
    }

    public static UserDTO fromEntity(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setGender(user.getGender());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setAvatar(user.getAvatar());
        return dto;
    }
}
