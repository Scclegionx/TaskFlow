package mobile_be.mobile_be.service.implementation;

//import mobile_be.mobile_be.config.JwtConstants;
//import mobile_be.mobile_be.config.TokenProvider;
import mobile_be.mobile_be.DTO.request.UpdateUserRequestDTO;
import mobile_be.mobile_be.exception.UserException;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.UserRepository;
import mobile_be.mobile_be.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
//    private final TokenProvider tokenProvider;

    @Override
    public User findUserById(int id) throws UserException {

        Optional<User> user = userRepository.findById(id);

        if (user.isPresent()) {
            return user.get();
        }

        throw new UserException("User not found with id " + id);
    }

    @Override
    public User findUserByProfile(String jwt) throws UserException {

//        String email = String.valueOf(tokenProvider.getClaimsFromToken(jwt).get(JwtConstants.EMAIL));
//
//        if (email == null) {
//            throw new BadCredentialsException("Invalid token");
//        }
//
//        Optional<User> user = userRepository.findByEmail(email);
//
//        if (user.isPresent()) {
//            return user.get();
//        }
//
//        throw new UserException("User not found with email " + email);
        return null;
    }

    @Override
    public User updateUser(int id, UpdateUserRequestDTO request) throws UserException {

        User user = findUserById(id);

//        if (Objects.nonNull(request.fullName())) {
//            user.setFullName(request.fullName());
//        }

        return userRepository.save(user);
    }

    @Override
    public List<User> searchUser(String query) {
//        return userRepository.findByFullNameOrEmail(query).stream()
//                .sorted(Comparator.comparing(User::getFullName))
//                .toList();
        return null;
    }

    @Override
    public List<User> searchUserByName(String name) {
//        return userRepository.findByFullName(name).stream()
//                .sorted(Comparator.comparing(User::getFullName))
//                .toList();
        return null;
    }

}
