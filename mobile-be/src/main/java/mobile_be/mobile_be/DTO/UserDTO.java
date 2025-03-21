package mobile_be.mobile_be.DTO;

import lombok.Data;
import mobile_be.mobile_be.Model.User;
import java.util.Set;
import java.util.stream.Collectors;

@Data
public class UserDTO {
    private Integer id;
    private String name;
    private String email;
    private boolean active;
    private Set<String> roles;

    // Constructor nhận User
    public UserDTO(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.active = user.isActive();
        this.roles = user.getRoles().stream()
                         .map(role -> role.getName())
                         .collect(Collectors.toSet());
    }

    public UserDTO() {
    }
}
