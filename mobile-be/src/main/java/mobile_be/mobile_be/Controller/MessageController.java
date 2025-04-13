package mobile_be.mobile_be.Controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import mobile_be.mobile_be.Model.Chat;
import mobile_be.mobile_be.Model.Message;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.ChatRepository;
import mobile_be.mobile_be.Repository.MessageRepository;
import mobile_be.mobile_be.Repository.UserRepository;
import mobile_be.mobile_be.Utils.JwtUtil;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    private final MessageRepository messageRepository;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final ChatRepository chatRepository;
    private final SimpMessagingTemplate messagingTemplate;
    public MessageController(MessageRepository messageRepository, JwtUtil jwtUtil, UserRepository userRepository, ChatRepository chatRepository, SimpMessagingTemplate messagingTemplate) {
        this.messageRepository = messageRepository;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.chatRepository = chatRepository;
        this.messagingTemplate = messagingTemplate;
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

    @Transactional
    @PostMapping("/{messageId}/share")
    public ResponseEntity<String> shareMessage(@PathVariable Long messageId, HttpServletRequest request, @RequestBody Long targetChatId) {
        // Extract token from Authorization header
        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            throw new RuntimeException("Token không hợp lệ");
        }
        token = token.substring(7);

        // Decode token to get userId
        int userId = jwtUtil.extractId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        // Retrieve the original message
        Message originalMessage = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message không tồn tại"));

        // Retrieve the target chat
        Chat targetChat = chatRepository.findById(targetChatId)
                .orElseThrow(() -> new RuntimeException("Chat không tồn tại"));
        // Check if the user is a member of the target chat
        if (!targetChat.getUsers().contains(user)) {
            return ResponseEntity.badRequest().body("Người dùng không phải là thành viên của chat này");
        }
        targetChat.setLastMessageTime(LocalDateTime.now());
        if (originalMessage.getContent().length() > 20) {
            targetChat.setLastMessage(user.getName() + ": " + originalMessage.getContent().substring(0, 20) + "...");
        } else {
            targetChat.setLastMessage(user.getName() + ": " + originalMessage.getContent());
        }
        // Create a new message with the same content as the original
        Message newMessage = new Message();
        newMessage.setContent(originalMessage.getContent());
        newMessage.setAttachmentType(originalMessage.getAttachmentType());
        newMessage.setAttachmentUrl(originalMessage.getAttachmentUrl());
        newMessage.setUser(user);
        newMessage.setChat(targetChat);
        newMessage.setTimeStamp(LocalDateTime.now()); // Set the current timestamp

        // Save the new message
        messageRepository.save(newMessage);
        messagingTemplate.convertAndSend("/topic/chat/" + targetChatId, newMessage);
        messagingTemplate.convertAndSend("/topic/update_last_message", targetChat);
        return ResponseEntity.ok("Tin nhắn đã được chia sẻ thành công");
    }


}
