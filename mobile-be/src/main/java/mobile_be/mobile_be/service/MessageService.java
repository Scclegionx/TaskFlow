package mobile_be.mobile_be.service;

import mobile_be.mobile_be.DTO.request.SendMessageRequestDTO;
import mobile_be.mobile_be.exception.ChatException;
import mobile_be.mobile_be.exception.MessageException;
import mobile_be.mobile_be.exception.UserException;
import mobile_be.mobile_be.Model.Message;
import mobile_be.mobile_be.Model.User;

import java.util.List;


public interface MessageService {

    Message sendMessage(SendMessageRequestDTO req, int userId) throws UserException, ChatException;

    List<Message> getChatMessages(int chatId, User reqUser) throws UserException, ChatException;

    Message findMessageById(int messageId) throws MessageException;

    void deleteMessageById(int messageId, User reqUser) throws UserException, MessageException;

}
