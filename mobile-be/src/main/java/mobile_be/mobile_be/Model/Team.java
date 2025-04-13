package mobile_be.mobile_be.Model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "team")
@AllArgsConstructor
@NoArgsConstructor
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;

    private String description;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @OneToMany(mappedBy = "team",fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<TeamMember> members = new ArrayList<>();

    private Integer status; // 0: inactive, 1: active

    private LocalDateTime createdAt;
}
