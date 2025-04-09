package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.UserNotice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserNoticeRepository extends JpaRepository<UserNotice, Integer> {
    List<UserNotice> findByUserId(Integer userId);
    Optional<UserNotice> findByUserIdAndNoticeId(Integer userId, Integer noticeId);
}
