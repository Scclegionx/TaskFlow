package mobile_be.mobile_be.Model;

import jakarta.persistence.*;
import lombok.*;


import java.util.*;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String chatName;
    private Boolean isGroup;

    @ManyToMany(cascade = CascadeType.ALL,fetch = FetchType.EAGER)
    private Set<User> admins = new HashSet<>();

    @ManyToMany(cascade = CascadeType.ALL,fetch = FetchType.EAGER)
    private Set<User> users = new HashSet<>();

    @ManyToOne(cascade = CascadeType.ALL,fetch = FetchType.EAGER)
    private User createdBy;

    @OneToMany(cascade = CascadeType.ALL,fetch = FetchType.EAGER)
    private List<Message> messages = new ArrayList<>();

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (!(obj instanceof Chat other)) {
            return false;
        }
        return Objects.equals(chatName, other.getChatName())
                && Objects.equals(isGroup, other.getIsGroup())
                && Objects.equals(admins, other.getAdmins())
                && Objects.equals(users, other.getUsers())
                && Objects.equals(createdBy, other.getCreatedBy());
    }

    @Override
    public int hashCode() {
        return Objects.hash(chatName, isGroup, admins, users, createdBy);
    }

    @Override
    public String toString() {
        return "Chat{" +
                "id=" + id +
                ", chatName='" + chatName + '\'' +
                ", isGroup=" + isGroup +
                '}';
    }

}
