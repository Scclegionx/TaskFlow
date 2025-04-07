package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    // Custom query methods can be defined here if needed
    Meeting findByChatId(Long chatId);
}
