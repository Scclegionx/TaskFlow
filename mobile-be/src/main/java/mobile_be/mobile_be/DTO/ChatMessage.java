package mobile_be.mobile_be.DTO;

import lombok.*;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessage {
    private Long chatId;
    private int senderId;
    private String content;
    private LocalDateTime timestamp;
}
