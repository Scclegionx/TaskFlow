package mobile_be.mobile_be.Model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.Date;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;


    // dung json ignore de tranh lap , k lay neu ko can thiet
    @OneToMany(mappedBy = "project", 
              fetch = FetchType.LAZY, 
              cascade = CascadeType.ALL, 
              orphanRemoval = true)
    @JsonIgnore
    private Set<ProjectMember> projectMembers = new HashSet<>();

    private Integer status = 1;

    // tgian tao du an
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt = new Date();

    // ngay bat dau
    private Date fromDate;

    // ngay ket thuc
    private Date toDate;
    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore 
    private Set<Task> tasks;

    
}
