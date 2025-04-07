package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.Chat;
import mobile_be.mobile_be.Model.Message;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findAllByChat(Chat chat);

    List<Message> findAllByChatId(long chatId);

    List<Message> findByChatIdAndAttachmentType(Long chatId, String attachmentType, Sort sort);
}
