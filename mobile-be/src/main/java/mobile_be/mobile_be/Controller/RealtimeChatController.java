package mobile_be.mobile_be.Controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import mobile_be.mobile_be.DTO.ChatMessage;
import mobile_be.mobile_be.Model.Chat;
import mobile_be.mobile_be.Model.Message;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.ChatRepository;
import mobile_be.mobile_be.Repository.MessageRepository;
import mobile_be.mobile_be.Repository.UserRepository;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import mobile_be.mobile_be.Utils.JwtUtil;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("api/chat")
public class RealtimeChatController {
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public RealtimeChatController(SimpMessagingTemplate messagingTemplate,
                                  ChatRepository chatRepository,
                                  MessageRepository messageRepository,
                                  UserRepository userRepository, JwtUtil jwtUtil) {
        this.messagingTemplate = messagingTemplate;
        this.chatRepository = chatRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    // 🟢 API kiểm tra hoặc tạo chat giữa hai người
    @Transactional
    @PostMapping("/start")
    public Chat startChat(@RequestParam int user2Id, HttpServletRequest request) {
        // 📌 Lấy token từ Authorization Header
        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            throw new RuntimeException("Token không hợp lệ");
        }
        token = token.substring(7); // Loại bỏ "Bearer "

        // 📌 Giải mã token để lấy user1Id
        int user1Id = jwtUtil.extractId(token);

        // 📌 Lấy thông tin user từ database
        User user1 = userRepository.findById(user1Id)
                .orElseThrow(() -> new RuntimeException("User1 không tồn tại"));
        User user2 = userRepository.findById(user2Id)
                .orElseThrow(() -> new RuntimeException("User2 không tồn tại"));

        // 📌 Kiểm tra xem chat đã tồn tại chưa
        Optional<Chat> existingChat = chatRepository.findAll().stream()
                .filter(chat -> chat.getUsers().contains(user1) && chat.getUsers().contains(user2) && !chat.getIsGroup())
                .findFirst();

        if (existingChat.isPresent()) {
            return existingChat.get(); // Trả về chat đã tồn tại
        }

        // 📌 Nếu chưa có, tạo chat mới
        Chat newChat = Chat.builder()
                .chatName(user1.getName() + " & " + user2.getName())
                .isGroup(false)
                .createdBy(user1.getId())
                .users(Set.of(user1, user2))
                .build();

        return chatRepository.save(newChat);
    }
    // 🟢 API gửi tin nhắn real-time qua WebSocket
    @MessageMapping("/chat/send")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        System.out.println("📩 Nhận tin nhắn: " + chatMessage);

        // ✅ Lưu tin nhắn vào database
        Message newMessage = Message.builder()
                .chat(chatRepository.findById(chatMessage.getChatId())
                        .orElseThrow(() -> new RuntimeException("Chat không tồn tại")))
                .user(userRepository.findById(chatMessage.getSenderId())
                        .orElseThrow(() -> new RuntimeException("User không tồn tại")))
                .content(chatMessage.getContent())
                .timeStamp(LocalDateTime.now())
                .build();

        messageRepository.save(newMessage);

        // ✅ Gửi tin nhắn real-time với toàn bộ Message đã lưu
        messagingTemplate.convertAndSend("/topic/chat/" + chatMessage.getChatId(), newMessage);
    }

    // 🟢 API lấy tin nhắn của chat
    @GetMapping("/{chatId}/messages")
    public List<Message> getMessages(@PathVariable Long chatId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat không tồn tại"));
        return messageRepository.findAllByChat(chat);
    }
}
