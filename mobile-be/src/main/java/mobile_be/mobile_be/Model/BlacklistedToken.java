package mobile_be.mobile_be.Model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "token_blacklist")
@Getter
@Setter
public class BlacklistedToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false, unique = true, columnDefinition = "TEXT")
    private String token;
}
