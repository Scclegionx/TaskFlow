package mobile_be.mobile_be.Model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_notice")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserNotice {

    @EmbeddedId
    private UserNoticeId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("noticeId")
    @JoinColumn(name = "notice_id")
    private Notice notice;

    @Column(name = "is_read")
    private boolean isRead = false;
}
