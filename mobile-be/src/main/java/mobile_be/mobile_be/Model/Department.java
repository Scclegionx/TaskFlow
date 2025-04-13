package mobile_be.mobile_be.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "department")
@NoArgsConstructor
@AllArgsConstructor
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;

    private String description;

    @ManyToOne
    @JoinColumn(name = "leader_id")
    private User leader;

    @OneToMany(mappedBy = "department",  cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Team> teams = new ArrayList<>();

    private Integer status; // 0: inactive, 1: active

    private LocalDateTime createdAt;
}
