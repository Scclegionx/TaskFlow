package mobile_be.mobile_be.DTO;

import lombok.*;
import mobile_be.mobile_be.Model.Message;
import mobile_be.mobile_be.Model.User;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageDTO {
    private Long id;
    private String content;
    private String attachmentUrl;
    private String attachmentType;
    private LocalDateTime timeStamp;
    private int userId; // id người gửi
    private String userName; // Tên người gửi
    private String userAvatar; // Avatar người gửi
    private Set<Integer> deletedForUserIds; // id của người dùng đã xóa tin nhắn
    private Long replyToId; // id tin nhắn trả lời (nếu có)
    private String replyToContent; // Nội dung tin nhắn trả lời

    // Constructor để chuyển đổi từ Message entity sang MessageDTO
    public MessageDTO(Message message) {
        this.id = message.getId();
        this.content = message.getContent();
        this.attachmentUrl = message.getAttachmentUrl();
        this.attachmentType = message.getAttachmentType();
        this.timeStamp = message.getTimeStamp();
        this.userId = message.getUser() != null ? message.getUser().getId() : null;
        this.userName = message.getUser() != null ? message.getUser().getName() : null;
        this.userAvatar = message.getUser() != null ? message.getUser().getAvatar() : null;

        // Lấy danh sách id của các người dùng đã xóa tin nhắn
        this.deletedForUserIds = message.getDeletedForUsers() != null ?
                message.getDeletedForUsers().stream().map(User::getId).collect(Collectors.toSet()) : null;

        // Nếu có tin nhắn trả lời, lấy thông tin về tin nhắn trả lời
        if (message.getReplyTo() != null) {
            this.replyToId = message.getReplyTo().getId();
            this.replyToContent = message.getReplyTo().getContent();
        }
    }
}
