package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {

    List<Message> findByChat_Id(int chatId);

}
