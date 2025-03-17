package mobile_be.mobile_be.Model;

import jakarta.persistence.*;
import lombok.*;


import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;


@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String content;
    private LocalDateTime timeStamp;

    @ManyToOne(cascade = CascadeType.ALL,fetch = FetchType.EAGER)
    private User user;

    @ManyToOne(cascade = CascadeType.ALL,fetch = FetchType.EAGER)
    private Chat chat;

    @ElementCollection
    private Set<Integer> readBy = new HashSet<>();

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (!(obj instanceof Message other)) {
            return false;
        }
        return Objects.equals(content, other.getContent())
                && Objects.equals(timeStamp, other.getTimeStamp())
                && Objects.equals(user, other.getUser())
                && Objects.equals(chat, other.getChat());
    }

    @Override
    public int hashCode() {
        return Objects.hash(content, timeStamp, user, chat);
    }

    @Override
    public String toString() {
        return "Message{" +
                "id=" + id +
                ", content='" + content + '\'' +
                ", timeStamp=" + timeStamp +
                '}';
    }

}
