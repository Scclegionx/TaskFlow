package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.Notice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoticeRepository extends JpaRepository<Notice, Long> {
}
