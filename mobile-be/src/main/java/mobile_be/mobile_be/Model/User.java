package mobile_be.mobile_be.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
    private String email;
    private Integer gender;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String password;
    private boolean isActive;
    private String avatar;
    private String resetPasswordToken;
    private LocalDateTime timeResetPasswordToken;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "role_user",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles;

    @OneToMany(mappedBy = "user",fetch = FetchType.EAGER,  cascade = CascadeType.ALL)
    @JsonIgnore
    private List<TeamMember> teamMemberships = new ArrayList<>();

    @OneToMany(mappedBy = "leader")
    @JsonIgnore
    private List<Department> departmentsLed = new ArrayList<>();
}