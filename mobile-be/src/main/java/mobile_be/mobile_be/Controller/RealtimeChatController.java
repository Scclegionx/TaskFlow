package mobile_be.mobile_be.Controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.transaction.Transactional;
import mobile_be.mobile_be.DTO.ChatDto;
import mobile_be.mobile_be.DTO.ChatMessage;
import mobile_be.mobile_be.DTO.GroupChatRequestDTO;
import mobile_be.mobile_be.Model.Chat;
import mobile_be.mobile_be.Model.Message;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.ChatRepository;
import mobile_be.mobile_be.Repository.MessageRepository;
import mobile_be.mobile_be.Repository.UserRepository;
import org.hibernate.Hibernate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import mobile_be.mobile_be.Utils.JwtUtil;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("api/chat")
public class RealtimeChatController {
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final Cloudinary cloudinary;

    public RealtimeChatController(SimpMessagingTemplate messagingTemplate,
                                  ChatRepository chatRepository,
                                  MessageRepository messageRepository,
                                  UserRepository userRepository, JwtUtil jwtUtil, Cloudinary cloudinary) {
        this.messagingTemplate = messagingTemplate;
        this.chatRepository = chatRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.cloudinary = cloudinary;
    }

    // 🟢 API kiểm tra hoặc tạo chat giữa hai người
    @Transactional
    @PostMapping("/start")
    public ChatDto startChat(@RequestParam int user2Id, HttpServletRequest request) {
        // 📌 Lấy token từ Authorization Header
        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            throw new RuntimeException("Token không hợp lệ");
        }
        token = token.substring(7);

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
            Chat chat = existingChat.get();

            // 📌 Lấy danh sách user đã xóa chat này
            List<Integer> deletedForUsers = chat.getDeletedForUsers().stream()
                    .map(User::getId)
                    .toList();

            // 📌 Nếu user1 đã xóa chat, loại bỏ user1 khỏi deletedForUsers
            if (deletedForUsers.contains(user1Id)) {
                chat.getDeletedForUsers().removeIf(user -> user.getId() == user1Id);
            }

            // 📌 Nếu user2 đã xóa chat, loại bỏ user2 khỏi deletedForUsers
            if (deletedForUsers.contains(user2Id)) {
                chat.getDeletedForUsers().removeIf(user -> user.getId() == user2Id);
            }
            chat.setLastMessageTime(LocalDateTime.now());
            // Lưu lại thông tin chat đã được cập nhật
            chatRepository.save(chat);

            // 📌 Tạo DTO cho cuộc trò chuyện đã khôi phục và gửi WebSocket
            ChatDto chatDto = new ChatDto(
                    chat.getId(),
                    chat.getChatName(),
                    chat.getIsGroup(),
                    null,  // Không có avatarUrl
                    null,  // Không có adminName
                    chat.getLastMessage(),
                    chat.getCreatedBy(),
                    user2.getName(),  // Trả về tên người nhắn cùng
                    null,  // Không có danh sách thành viên vì đây là chat đơn
                    deletedForUsers // ⚡ Thêm danh sách user đã xóa chat
            );

            // 📌 Gửi cập nhật WebSocket **chỉ đến user1 và user2**
            messagingTemplate.convertAndSend("/queue/user-" + user1Id + "/new_chat", chatDto);
            messagingTemplate.convertAndSend("/queue/user-" + user2Id + "/new_chat", chatDto);
            return chatDto;
        }

        // 📌 Nếu chưa có, tạo chat mới
        Chat newChat = Chat.builder()
                .chatName(user2.getName()+" & "+user1.getName())
                .isGroup(false)
                .createdBy(user1.getId())
                .lastMessage("")
                .lastMessageTime(LocalDateTime.now())
                .users(new HashSet<>(List.of(user1, user2))) // ⚡ Sửa lỗi Set.of() thành HashSet<>
                .deletedForUsers(new HashSet<>()) // ⚡ Đảm bảo danh sách trống khi tạo mới
                .build();

        Chat savedChat = chatRepository.save(newChat);

        // 📌 Tạo DTO với chatPartnerName
        ChatDto newChatDto = new ChatDto(
                savedChat.getId(),
                savedChat.getChatName(),
                savedChat.getIsGroup(),
                null,  // Không có avatarUrl
                null,  // Không có adminName
                savedChat.getLastMessage(),
                savedChat.getCreatedBy(),
                user2.getName(),  // Tên người còn lại trong cuộc trò chuyện
                null,  // Không có danh sách thành viên vì đây là chat đơn
                new ArrayList<>() // ⚡ Trả về danh sách rỗng vì chat mới tạo
        );

        // 📌 Gửi cập nhật WebSocket **chỉ đến user1 và user2**
        messagingTemplate.convertAndSend("/queue/user-" + user1Id + "/new_chat", newChatDto);
        messagingTemplate.convertAndSend("/queue/user-" + user2Id + "/new_chat", newChatDto);

        return newChatDto;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String mimeType = file.getContentType();
            String resourceType = "auto";
            String attachmentType = "raw";

            if (mimeType != null && mimeType.startsWith("image")) {
                resourceType = "image";attachmentType = "image";
            }
            else if (mimeType != null && mimeType.startsWith("video")) {
                resourceType = "video";attachmentType = "video";
            } else if (mimeType != null && mimeType.startsWith("application/pdf")) {
                resourceType = "image";attachmentType = "pdf";
            }
            else {
                resourceType = "raw";
            }

            // Lấy tên gốc của file
            String originalFilename = file.getOriginalFilename();
            assert originalFilename != null;

            // Xóa các ký tự đặc biệt để tránh lỗi
            String safeFilename = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");

            // Upload file lên Cloudinary với tên gốc
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", resourceType,
                            "public_id", "uploads/" + safeFilename // Giữ nguyên tên file
                    )
            );

            String fileUrl = (String) uploadResult.get("secure_url");

            return ResponseEntity.ok(Map.of("fileUrl", fileUrl,"attachmentType", attachmentType));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @Transactional
    @MessageMapping("/chat/send")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        System.out.println("📩 Nhận tin nhắn: " + chatMessage);

        // ✅ Lấy thông tin cuộc trò chuyện
        Chat chat = chatRepository.findById(chatMessage.getChatId())
                .orElseThrow(() -> new RuntimeException("Chat không tồn tại"));

        // ✅ Lấy thông tin người gửi
        User sender = userRepository.findById(chatMessage.getSenderId())
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // ✅ Lưu tin nhắn vào database
        Message newMessage = Message.builder()
                .chat(chat)
                .user(sender)
                .content(chatMessage.getContent())
                .attachmentUrl(chatMessage.getAttachmentUrl())
                .attachmentType(chatMessage.getAttachmentType())
                .timeStamp(LocalDateTime.now())
                .build();

        messageRepository.save(newMessage);

        // ✅ Cập nhật lastMessage trong chat
        if (chatMessage.getContent().length() > 20) {
            chat.setLastMessage(sender.getName() + ": " + chatMessage.getContent().substring(0, 20) + "...");
        } else {
            chat.setLastMessage(sender.getName() + ": " + chatMessage.getContent());
        }

        chat.setLastMessageTime(LocalDateTime.now());
        chat.getDeletedForUsers().clear();
        chatRepository.save(chat);

        // ✅ Gửi tin nhắn real-time
        messagingTemplate.convertAndSend("/topic/chat/" + chatMessage.getChatId(), newMessage);
        messagingTemplate.convertAndSend("/topic/update_last_message", chat);
    }

    // 🟢 API lấy tin nhắn của chat
//    @Transactional
//    @GetMapping("/{chatId}/messages")
//    public List<MessageDTO> getMessages(@PathVariable Long chatId) {
//        // Lấy danh sách tin nhắn với thông tin `deletedForUsers` đã được tải
//        List<Message> messages = messageRepository.findMessagesWithDeletedUsers(chatId);
//
//        // Chuyển đổi từ Message thành MessageDTO
//        return messages.stream()
//                .map(MessageDTO::new)
//                .collect(Collectors.toList());
//    }
    @Transactional
    @GetMapping("/{chatId}/messages")
    public List<Message> getMessagesByChatId(@PathVariable Long chatId) {
        List<Message> messages = messageRepository.findAllByChatId(chatId);

        for (Message message : messages) {
            Hibernate.initialize(message.getChat().getDeletedForUsers());
        }

        return messages;
    }

    @Transactional
    @PostMapping("/create-group")
    public ResponseEntity<ChatDto> createGroupChat(@RequestBody GroupChatRequestDTO request, HttpServletRequest httpRequest) {
        String token = httpRequest.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            throw new RuntimeException("Token không hợp lệ");
        }
        token = token.substring(7); // Loại bỏ "Bearer "

        // 📌 Giải mã token để lấy userId của người tạo nhóm
        int adminId = jwtUtil.extractId(token);

        // 📌 Lấy thông tin người tạo nhóm
        User adminUser = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Người tạo nhóm không tồn tại"));

        // 📌 Lấy danh sách người dùng tham gia nhóm
        Set<User> members = new HashSet<>(userRepository.findAllById(request.getUserIds()));
        if (members.isEmpty()) {
            throw new RuntimeException("Không có thành viên nào hợp lệ");
        }

        // 📌 Thêm admin vào danh sách thành viên
        members.add(adminUser);

        // 📌 Tạo nhóm chat
        Chat groupChat = Chat.builder()
                .chatName(request.getGroupName())
                .isGroup(true)
                .admin(adminUser)
                .createdBy(adminUser.getId())
                .users(members)
                .lastMessage("") // Ban đầu chưa có tin nhắn nào
                .lastMessageTime(LocalDateTime.now())
                .build();

        Chat savedGroupChat = chatRepository.save(groupChat);

        // 📌 Chuyển đổi thành ChatDto
        ChatDto groupChatDto = new ChatDto(
                savedGroupChat.getId(),
                savedGroupChat.getChatName(),
                savedGroupChat.getIsGroup(),
                null,  // Không có avatarUrl
                adminUser.getName(), // Admin của nhóm
                savedGroupChat.getLastMessage(),
                savedGroupChat.getCreatedBy(),
                null, // Không có chatPartnerName vì là nhóm
                members.stream().map(User::getName).toList(), // Danh sách thành viên
                new ArrayList<>() // ⚡ Trả về danh sách rỗng vì chat mới tạo
        );

        // 🔴 **Gửi thông báo WebSocket đến từng thành viên trong nhóm**
        for (User member : members) {
            messagingTemplate.convertAndSend("/queue/user-" + member.getId() + "/new_chat", groupChatDto);
        }

        return ResponseEntity.ok(groupChatDto);
    }

    // 🟢 API lấy danh sách chat của user
//    @Transactional
//    @GetMapping("/list")
//    public List<ChatDto> getChats(HttpServletRequest request) {
//        // 📌 Lấy token từ Authorization Header
//        String token = request.getHeader("Authorization");
//        if (token == null || !token.startsWith("Bearer ")) {
//            throw new RuntimeException("Token không hợp lệ");
//        }
//        token = token.substring(7);
//
//        // 📌 Giải mã token để lấy userId
//        int userId = jwtUtil.extractId(token);
//
//        // 📌 Lấy danh sách chat mà user tham gia
//        return chatRepository.findAll().stream()
//                .filter(chat -> chat.getUsers().stream().anyMatch(user -> user.getId().equals(userId)))
//                .map(chat -> {
//                    String chatPartnerName = null;
//                    List<String> memberNames = chat.getUsers().stream()
//                            .map(User::getName)
//                            .toList();
//
//                    // Nếu là chat 1-1, lấy tên người còn lại
//                    if (!chat.getIsGroup() && chat.getUsers().size() == 2) {
//                        chatPartnerName = chat.getUsers().stream()
//                                .filter(user -> !user.getId().equals(userId))
//                                .map(User::getName)
//                                .findFirst()
//                                .orElse(null);
//                    }
//
//                    // 📌 Lấy danh sách ID của những user đã xóa chat
//                    List<Integer> deletedForUsers = chat.getDeletedForUsers().stream()
//                            .map(User::getId)
//                            .toList();
//
//                    // Tạo DTO chứa thông tin chat
//                    return new ChatDto(
//                            chat.getId(),
//                            chat.getChatName(),
//                            chat.getIsGroup(),
//                            chat.getAvatarUrl(),
//                            chat.getAdmin() != null ? chat.getAdmin().getName() : null,
//                            chat.getLastMessage(),
//                            chat.getCreatedBy(),
//                            chatPartnerName,
//                            memberNames,
//                            deletedForUsers // ⚡ Thêm vào DTO
//                    );
//                })
//                .toList();
//    }
    @Transactional
    @GetMapping("/list")
    public List<Chat> getChats(HttpServletRequest request) {
        // 📌 Lấy token từ Authorization Header
        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            throw new RuntimeException("Token không hợp lệ");
        }
        token = token.substring(7);

        // 📌 Giải mã token để lấy userId
        int userId = jwtUtil.extractId(token);

        // 📌 Lọc danh sách chat mà user tham gia
        return chatRepository.findAll().stream()
                .filter(chat -> chat.getUsers().stream().anyMatch(user -> user.getId().equals(userId)))
                .toList();
    }


    @Transactional
    @DeleteMapping("/{chatId}")
    public ResponseEntity<String> deleteChat(@PathVariable long chatId, HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            throw new RuntimeException("Token không hợp lệ");
        }
        token = token.substring(7); // Loại bỏ "Bearer "
        int userId = jwtUtil.extractId(token);

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat không tồn tại"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (!chat.getUsers().contains(user)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Bạn không thuộc chat này");
        }
        chat.getDeletedForUsers().add(user);
        // Thêm user vào deletedForUsers của mỗi tin nhắn trong chat này
        List<Message> messages = messageRepository.findAllByChat(chat);
        for (Message message : messages) {
            message.getDeletedForUsers().add(user);
            messageRepository.save(message);
        }

        return ResponseEntity.ok("Xóa cuộc trò chuyện thành công");
    }

    @Transactional
    @GetMapping("/{chatId}")
    public Chat getChat(@PathVariable long chatId) {
        return chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat không tồn tại"));
    }

    @Transactional
    @PutMapping("/{chatId}/change-name")
    public ResponseEntity<String> changeChatName(@PathVariable long chatId, @RequestBody Map<String, String> request) {
        String newName = request.get("newName");
        if (newName == null || newName.isEmpty()) {
            return ResponseEntity.badRequest().body("Tên nhóm không được để trống");
        }

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat không tồn tại"));

        chat.setChatName(newName);
        chatRepository.save(chat);

        return ResponseEntity.ok("Đổi tên nhóm thành công");
    }

    @Transactional
    @PutMapping("/{chatId}/add-member")
    public ResponseEntity<Chat> addMemberToGroup(@PathVariable long chatId, @RequestBody Map<String, List<Integer>> request) {
        List<Integer> userIds = request.get("userIds");
        if (userIds == null || userIds.isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat không tồn tại"));

        Set<User> newMembers = new HashSet<>(userRepository.findAllById(userIds));
        chat.getUsers().addAll(newMembers);
        chatRepository.save(chat);

        return ResponseEntity.ok(chat);
    }

    @Transactional
    @PutMapping("/{chatId}/remove-member")
    public ResponseEntity<Chat> removeMemberFromGroup(@PathVariable long chatId, @RequestBody Map<String, List<Integer>> request) {
        List<Integer> userIds = request.get("userIds");
        if (userIds == null || userIds.isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat không tồn tại"));

        Set<User> membersToRemove = new HashSet<>(userRepository.findAllById(userIds));
        chat.getUsers().removeAll(membersToRemove);
        chatRepository.save(chat);

        return ResponseEntity.ok(chat);
    }

    @Transactional
    @PostMapping("/{chatId}/change-avatar")
    public ResponseEntity<?> changeGroupAvatar(@PathVariable long chatId, @RequestParam("avatar") MultipartFile file) {
        try {
            // Check if file is empty
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File không hợp lệ");
            }

            // Find the chat by ID
            Chat chat = chatRepository.findById(chatId)
                    .orElseThrow(() -> new RuntimeException("Chat không tồn tại"));

            // Check if the chat is a group
            if (!chat.getIsGroup()) {
                return ResponseEntity.badRequest().body("Không thể đổi avatar cho chat cá nhân");
            }

            // Upload file to Cloudinary
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
            String imageUrl = (String) uploadResult.get("url");

            // Update chat's avatar URL
            chat.setAvatarUrl(imageUrl);
            chatRepository.save(chat);

            return ResponseEntity.ok(chat);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error uploading file");
        }
    }

    @Transactional
    @PostMapping("/{chatId}/leave")
    public ResponseEntity<String> leaveGroupChat(@PathVariable long chatId, HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            throw new RuntimeException("Token không hợp lệ");
        }
        token = token.substring(7); // Loại bỏ "Bearer "
        int userId = jwtUtil.extractId(token);

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat không tồn tại"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (!chat.getUsers().contains(user)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Bạn không thuộc chat này");
        }

        chat.getUsers().remove(user);
        chatRepository.save(chat);

        return ResponseEntity.ok("Bạn đã rời khỏi nhóm thành công");
    }

    @Transactional
    @PostMapping("/{chatId}/delete")
    public ResponseEntity<String> deleteGroupChat(@PathVariable long chatId, HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            throw new RuntimeException("Token không hợp lệ");
        }
        token = token.substring(7); // Loại bỏ "Bearer "
        int userId = jwtUtil.extractId(token);

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat không tồn tại"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (!chat.getAdmin().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Bạn không phải là admin của nhóm này");
        }

        chatRepository.delete(chat);

        return ResponseEntity.ok("Nhóm đã được xóa thành công");
    }

    @Transactional
    @PostMapping("/{chatId}/change-admin")
    public ResponseEntity<Chat> changeGroupAdmin(@PathVariable long chatId, @RequestBody Map<String, Integer> request) {
        System.out.println("Request body: " + request);
        int newAdminId = request.get("newAdminId");
        System.out.println("newAdminId: " + newAdminId);


        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat không tồn tại"));

        User newAdmin = userRepository.findById(newAdminId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        chat.setAdmin(newAdmin);
        chatRepository.save(chat);

        return ResponseEntity.ok(chat);
    }
}
