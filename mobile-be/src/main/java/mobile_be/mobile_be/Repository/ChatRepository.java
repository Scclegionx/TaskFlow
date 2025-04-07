package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.Chat;
import mobile_be.mobile_be.Model.Message;
import mobile_be.mobile_be.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatRepository extends JpaRepository<Chat, Long> {
    List<Chat> findAllByUsers(User user);
}
