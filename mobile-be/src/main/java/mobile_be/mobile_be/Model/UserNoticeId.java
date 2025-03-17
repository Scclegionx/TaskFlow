package mobile_be.mobile_be.Model;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class UserNoticeId implements Serializable {
    private Integer userId;
    private Integer noticeId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserNoticeId that = (UserNoticeId) o;
        return Objects.equals(userId, that.userId) &&
               Objects.equals(noticeId, that.noticeId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, noticeId);
    }
}
