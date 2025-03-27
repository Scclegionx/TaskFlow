package mobile_be.mobile_be.Model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "chat_id")
    private Chat chat;
    @Column(name = "content", columnDefinition = "TEXT") // ✅ Hỗ trợ văn bản dài
    private String content;
    private LocalDateTime timeStamp;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

}
