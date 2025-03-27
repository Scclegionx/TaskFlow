package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatRepository extends JpaRepository<Chat, Long> {
}
