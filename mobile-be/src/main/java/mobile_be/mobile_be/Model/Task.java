package mobile_be.mobile_be.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;
@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    // nguoi tao task
    private Integer createdBy;
    // tao bang trung gian cho task va user
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "task_assignees",
            joinColumns = @JoinColumn(name = "task_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> assignees; // Danh sách người thực hiện

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // sua lai thanh from , to cho ro rang thay vi de minh deadline
    private LocalDateTime fromDate;

    private LocalDateTime toDate;

    private Integer status;

    private LocalDateTime createdAt;

    // muc do uu tien | kho khan cua task
    private Integer level;

    // trang thai cho duyet hoan thanh
    private Integer waitFinish;


}

