package mobile_be.mobile_be.Controller;

import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<User> getUsers() throws ExecutionException, InterruptedException {
        return userRepository.findAll();
    }

    @PostMapping
    public User createUser(@RequestBody User user) throws ExecutionException, InterruptedException {
        return userRepository.save(user);
    }
}