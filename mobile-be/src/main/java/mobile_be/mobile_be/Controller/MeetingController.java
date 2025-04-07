package mobile_be.mobile_be.Controller;

import mobile_be.mobile_be.Model.Chat;
import mobile_be.mobile_be.Model.Meeting;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.ChatRepository;
import mobile_be.mobile_be.Repository.MeetingRepository;
import mobile_be.mobile_be.Repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/meetings")
public class MeetingController {

    private final MeetingRepository meetingRepository;
    private final UserRepository userRepository;
    private final ChatRepository chatRepository;

    public MeetingController(MeetingRepository meetingRepository, UserRepository userRepository, ChatRepository chatRepository) {
        this.meetingRepository = meetingRepository;
        this.userRepository = userRepository;
        this.chatRepository = chatRepository;
    }

    @PostMapping("/createOrJoin/{chatId}")
    public Meeting createOrJoinMeeting(@PathVariable Long chatId) {
        // Kiểm tra xem chat có tồn tại không
        Chat chat = chatRepository.findById(chatId).orElseThrow(() -> new IllegalArgumentException("Chat không tồn tại"));
        // Kiểm tra nếu cuộc họp đã tồn tại cho chat này
        Meeting existingMeeting = meetingRepository.findByChatId(chatId);
        if (existingMeeting != null) {
            // Nếu cuộc họp đã tồn tại, trả về URL của cuộc họp đó
            return existingMeeting;
        }

        // Nếu chưa có cuộc họp, tạo mới
        String roomName = "room-" + UUID.randomUUID();
        String meetingUrl = "https://meet.jit.si/" + roomName;

        // Tạo mới cuộc họp
        Meeting meeting = Meeting.builder()
                .meetingUrl(meetingUrl)
                .createdAt(LocalDateTime.now())
                .chat(chat)  // Liên kết cuộc họp với chat
                .build();

        // Lưu cuộc họp mới vào cơ sở dữ liệu
        return meetingRepository.save(meeting);
    }

}
