package mobile_be.mobile_be.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "chat")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String chatName;

    private Boolean isGroup;
    private String avatarUrl;
    @ManyToOne
    @JoinColumn(name = "admin_id")
    private User admin;

    private String lastMessage;
    private LocalDateTime lastMessageTime;
    @ManyToMany(fetch = FetchType.EAGER)
    private Set<User> users = new HashSet<>();

    private Integer createdBy;

    // xoa con trong danh sach entity cha thi cung tu dong xoa con trong database
    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<Message> messages = new HashSet<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "deleted_chats",
            joinColumns = @JoinColumn(name = "chat_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> deletedForUsers = new HashSet<>();

}
