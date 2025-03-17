package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.Chat;
import mobile_be.mobile_be.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface ChatRepository extends JpaRepository<Chat, Integer> {

    @Query("select c from Chat c join c.users u where u.id = :userId")
    List<Chat> findChatByUserId(@Param("userId") int userId);

    @Query("SELECT c FROM Chat c WHERE c.isGroup = false AND :user2 MEMBER OF c.users AND :reqUser MEMBER OF c.users")
    Optional<Chat> findSingleChatByUsers(@Param("user2") User user2, @Param("reqUser") User reqUser);

}
