package mobile_be.mobile_be.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class ChatDto {
    private Long id;
    private String chatName;
    private Boolean isGroup;
    private String avatarUrl;
    private String adminName;
    private String lastMessage;
    private Integer createdBy;
    private String chatPartnerName;
    private List<String> members;
    private List<Integer> deletedForUsers; // ⚡ Thêm danh sách ID của user đã xóa chat
}
