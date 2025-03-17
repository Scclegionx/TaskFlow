package mobile_be.mobile_be.Model;
import mobile_be.mobile_be.Model.User;


import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "notices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String title;
    private String message;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public Notice(String title, String message) {
        this.title = title;
        this.message = message;
        this.createdAt = Instant.now();
    }
}
