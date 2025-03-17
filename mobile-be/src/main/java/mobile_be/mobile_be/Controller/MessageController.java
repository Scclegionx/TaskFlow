package mobile_be.mobile_be.Controller;


import mobile_be.mobile_be.DTO.request.SendMessageRequestDTO;
import mobile_be.mobile_be.DTO.response.ApiResponseDTO;
import mobile_be.mobile_be.DTO.response.MessageDTO;
import mobile_be.mobile_be.Repository.UserRepository;
import mobile_be.mobile_be.exception.ChatException;
import mobile_be.mobile_be.exception.MessageException;
import mobile_be.mobile_be.exception.UserException;
import mobile_be.mobile_be.Model.Message;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.service.MessageService;
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
@RequestMapping("/api/messages")
public class MessageController {

    private final UserService userService;
    private final MessageService messageService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/create")
    public ResponseEntity<MessageDTO> sendMessage(@RequestBody SendMessageRequestDTO req,
                                                  @RequestParam("id") int id)
            throws ChatException, UserException {

        User user = userRepository.findById(id).get();
        Message message = messageService.sendMessage(req, user.getId());
        log.info("User {} sent message: {}", user.getEmail(), message.getId());

        return new ResponseEntity<>(MessageDTO.fromMessage(message), HttpStatus.OK);
    }

    @GetMapping("/chat/{chatId}")
    public ResponseEntity<List<MessageDTO>> getChatMessages(@PathVariable int chatId,
                                                         @RequestParam("id") int id)
            throws ChatException, UserException {

//        User user = userService.findUserByProfile(jwt);
        User user = userRepository.findById(id).get();
        List<Message> messages = messageService.getChatMessages(chatId, user);

        return new ResponseEntity<>(MessageDTO.fromMessages(messages), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO> deleteMessage(@PathVariable int id,
                                                        @RequestParam("id") int user_id)
            throws UserException, MessageException {

        User user = userRepository.findById(user_id).get();
        messageService.deleteMessageById(id, user);
        log.info("User {} deleted message: {}", user.getEmail(), id);

        ApiResponseDTO res = ApiResponseDTO.builder()
                .message("Message deleted successfully")
                .status(true)
                .build();

        return new ResponseEntity<>(res, HttpStatus.OK);
    }

}
