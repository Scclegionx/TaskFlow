package mobile_be.mobile_be.Model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "meetings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Meeting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String meetingUrl;
    private LocalDateTime createdAt;
    private LocalDateTime endAt;

    @ManyToOne
    @JoinColumn(name = "chat_id")
    private Chat chat;
}
