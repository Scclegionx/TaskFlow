package mobile_be.mobile_be.Controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import mobile_be.mobile_be.Model.Message;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.MessageRepository;
import mobile_be.mobile_be.Repository.UserRepository;
import mobile_be.mobile_be.Utils.JwtUtil;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    private final MessageRepository messageRepository;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    public MessageController(MessageRepository messageRepository, JwtUtil jwtUtil, UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Transactional
    @GetMapping("/{chatId}/{attachmentType}")
    public ResponseEntity<List<Message>> getAttachmentMessagesByChat(@PathVariable Long chatId,
                                                                      @PathVariable String attachmentType) {
        // Lấy danh sách tin nhắn có attachmentType là IMAGE
        List<Message> imageMessages = messageRepository.findByChatIdAndAttachmentType(chatId, attachmentType, Sort.by(Sort.Order.desc("timeStamp")));

        // Trả về danh sách tin nhắn
        return ResponseEntity.ok(imageMessages);
    }

    @Transactional
    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long messageId) {
        // Xóa tin nhắn theo ID
        messageRepository.deleteById(messageId);
        return ResponseEntity.noContent().build();
    }

    @Transactional
    @PostMapping("/{messageId}/hide")
    public ResponseEntity<Void> hideMessage(@PathVariable Long messageId, HttpServletRequest request) {
        // Lấy token từ Authorization Header
        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            throw new RuntimeException("Token không hợp lệ");
        }
        token = token.substring(7);

        // Giải mã token để lấy userId
        int userId = jwtUtil.extractId(token);

        // Ẩn tin nhắn theo ID
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        // Thêm userId vào setDeletedForUsers
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        message.getDeletedForUsers().add(user);
        messageRepository.save(message);

        return ResponseEntity.noContent().build();
    }


}
