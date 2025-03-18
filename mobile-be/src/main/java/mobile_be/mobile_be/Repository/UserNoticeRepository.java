package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.UserNotice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserNoticeRepository extends JpaRepository<UserNotice, Integer> {
    List<UserNotice> findByUserId(Integer userId);
}
