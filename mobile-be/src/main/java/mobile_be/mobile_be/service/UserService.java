package mobile_be.mobile_be.service;

import mobile_be.mobile_be.DTO.request.UpdateUserRequestDTO;
import mobile_be.mobile_be.exception.UserException;
import mobile_be.mobile_be.Model.User;

import java.util.List;


public interface UserService {

    User findUserById(int id) throws UserException;

    User findUserByProfile(String jwt) throws UserException;

    User updateUser(int id, UpdateUserRequestDTO request) throws UserException;

    List<User> searchUser(String query);

    List<User> searchUserByName(String name);

}
