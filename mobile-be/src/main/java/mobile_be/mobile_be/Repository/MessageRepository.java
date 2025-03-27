package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.Chat;
import mobile_be.mobile_be.Model.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findAllByChat(Chat chat);
}
