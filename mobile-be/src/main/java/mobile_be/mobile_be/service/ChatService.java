package mobile_be.mobile_be.service;

import mobile_be.mobile_be.DTO.request.GroupChatRequestDTO;
import mobile_be.mobile_be.exception.ChatException;
import mobile_be.mobile_be.exception.UserException;
import mobile_be.mobile_be.Model.Chat;
import mobile_be.mobile_be.Model.User;

import java.util.List;


public interface ChatService {

    Chat createChat(User reqUser, int userId2) throws UserException;

    Chat findChatById(int id) throws ChatException;

    List<Chat> findAllByUserId(int userId) throws UserException;

    Chat createGroup(GroupChatRequestDTO req, User reqUser) throws UserException;

    Chat addUserToGroup(int userId, int chatId, User reqUser) throws UserException, ChatException;

    Chat renameGroup(int chatId, String groupName, User reqUser) throws UserException, ChatException;

    Chat removeFromGroup(int chatId, int userId, User reqUser) throws UserException, ChatException;

    void deleteChat(int chatId, int userId) throws UserException, ChatException;

    Chat markAsRead(int chatId, User reqUser) throws ChatException, UserException;

}
