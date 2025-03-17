package mobile_be.mobile_be.service.implementation;

import mobile_be.mobile_be.DTO.request.SendMessageRequestDTO;
import mobile_be.mobile_be.exception.ChatException;
import mobile_be.mobile_be.exception.MessageException;
import mobile_be.mobile_be.exception.UserException;
import mobile_be.mobile_be.Model.Chat;
import mobile_be.mobile_be.Model.Message;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.MessageRepository;
import mobile_be.mobile_be.service.ChatService;
import mobile_be.mobile_be.service.MessageService;
import mobile_be.mobile_be.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final UserService userService;
    private final ChatService chatService;
    private final MessageRepository messageRepository;

    @Override
    public Message sendMessage(SendMessageRequestDTO req, int userId) throws UserException, ChatException {

        User user = userService.findUserById(userId);
        Chat chat = chatService.findChatById(req.chatId());

        Message message = Message.builder()
                .chat(chat)
                .user(user)
                .content(req.content())
                .timeStamp(LocalDateTime.now())
                .readBy(new HashSet<>(Set.of(user.getId())))
                .build();

        chat.getMessages().add(message);

        System.out.println("MessageServiceImpl.sendMessage: " + message);
        return messageRepository.save(message);
    }

    @Override
    public List<Message> getChatMessages(int chatId, User reqUser) throws UserException, ChatException {

        Chat chat = chatService.findChatById(chatId);

        if (!chat.getUsers().contains(reqUser)) {
            throw new UserException("User isn't related to chat " + chatId);
        }

        return messageRepository.findByChat_Id(chat.getId());
    }

    @Override
    public Message findMessageById(int messageId) throws MessageException {

        Optional<Message> message = messageRepository.findById(messageId);

        if (message.isPresent()) {
            return message.get();
        }

        throw new MessageException("Message not found " + messageId);
    }

    @Override
    public void deleteMessageById(int messageId, User reqUser) throws UserException, MessageException {

        Message message = findMessageById(messageId);

//        if (message.getUser().getId().equals(reqUser.getId())) {
            messageRepository.deleteById(messageId);
//            return;
//        }

//        throw new UserException("User is not related to message " + message.getId());
    }

}
