package mobile_be.mobile_be.Controller;

import mobile_be.mobile_be.DTO.request.GroupChatRequestDTO;
import mobile_be.mobile_be.DTO.response.ApiResponseDTO;
import mobile_be.mobile_be.DTO.response.ChatDTO;
import mobile_be.mobile_be.Repository.UserRepository;
import mobile_be.mobile_be.exception.ChatException;
import mobile_be.mobile_be.exception.UserException;
import mobile_be.mobile_be.Model.Chat;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.service.ChatService;
import mobile_be.mobile_be.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chats")
public class ChatController {

    private final UserService userService;
    private final ChatService chatService;
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/single")
    public ResponseEntity<ChatDTO> createSingleChat(@RequestBody int userId,
                                                    @RequestParam("id") int id)
            throws UserException {

        User user = userRepository.findById(id).get();
        Chat chat = chatService.createChat(user, userId);
        log.info("User {} created single chat: {}", user.getEmail(), chat.getId());

        return new ResponseEntity<>(ChatDTO.fromChat(chat), HttpStatus.OK);
    }

    @PostMapping("/group")
    public ResponseEntity<ChatDTO> createGroupChat(@RequestBody GroupChatRequestDTO req,
                                                   @RequestParam("id") int id)
            throws UserException {

        User user = userRepository.findById(id).get();
        Chat chat = chatService.createGroup(req, user);
        log.info("User {} created group chat: {}", user.getEmail(), chat.getId());

        return new ResponseEntity<>(ChatDTO.fromChat(chat), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChatDTO> findChatById(@PathVariable("id") int id)
            throws ChatException {

        Chat chat = chatService.findChatById(id);

        return new ResponseEntity<>(ChatDTO.fromChat(chat), HttpStatus.OK);
    }

    @GetMapping("/user")
    public ResponseEntity<List<ChatDTO>> findAllChatsByUserId( @RequestParam("id") int id)
            throws UserException {

        log.info("Finding all chats for user: {}", id);
        User user = userRepository.findById(id).get();
        log.info("hha " +  user.getEmail());
        List<Chat> chats = chatService.findAllByUserId(user.getId());

        System.out.println("chats2222222: " + chats);
        return new ResponseEntity<>(ChatDTO.fromChats(chats), HttpStatus.OK);
    }

    @PutMapping("/{chatId}/add/{userId}")
    public ResponseEntity<ChatDTO> addUserToGroup(@PathVariable int chatId, @PathVariable int userId,
                                                  @RequestParam("id") int id)
            throws UserException, ChatException {

        User user = userRepository.findById(id).get();
        Chat chat = chatService.addUserToGroup(userId, chatId, user);
        log.info("User {} added user {} to group chat: {}", user.getEmail(), userId, chat.getId());

        return new ResponseEntity<>(ChatDTO.fromChat(chat), HttpStatus.OK);
    }

    @PutMapping("/{chatId}/remove/{userId}")
    public ResponseEntity<ChatDTO> removeUserFromGroup(@PathVariable int chatId, @PathVariable int userId,
                                                       @RequestParam("id") int id)
            throws UserException, ChatException {

        User user = userRepository.findById(id).get();
        Chat chat = chatService.removeFromGroup(chatId, userId, user);
        log.info("User {} removed user {} from group chat: {}", user.getEmail(), userId, chat.getId());

        return new ResponseEntity<>(ChatDTO.fromChat(chat), HttpStatus.OK);
    }

    @PutMapping("/{chatId}/markAsRead")
    public ResponseEntity<ChatDTO> markAsRead(@PathVariable int chatId,
                                              @RequestParam("id") int id)
            throws UserException, ChatException {

        User user = userRepository.findById(id).get();
        Chat chat = chatService.markAsRead(chatId, user);
        log.info("Chat {} marked as read for user: {}", chatId, user.getEmail());

        return new ResponseEntity<>(ChatDTO.fromChat(chat), HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponseDTO> deleteChat(@PathVariable int id,
                                                     @RequestParam("id") int user_id)
            throws UserException, ChatException {

        User user = userRepository.findById(user_id).get();
        chatService.deleteChat(id, user.getId());
        log.info("User {} deleted chat: {}", user.getEmail(), id);

        ApiResponseDTO res = ApiResponseDTO.builder()
                .message("Chat deleted successfully")
                .status(true)
                .build();

        return new ResponseEntity<>(res, HttpStatus.OK);
    }

}
