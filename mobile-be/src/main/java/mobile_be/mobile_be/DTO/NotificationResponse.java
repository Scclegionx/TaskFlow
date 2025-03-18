package mobile_be.mobile_be.DTO;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class NotificationResponse {
    private Integer id;
    private String title;
    private String message;
    private boolean isRead;
    private Instant createdAt;
}
