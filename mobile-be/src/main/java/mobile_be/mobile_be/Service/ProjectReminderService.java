package mobile_be.mobile_be.Service;

import lombok.extern.slf4j.Slf4j;
import mobile_be.mobile_be.Model.*;
import mobile_be.mobile_be.Repository.NoticeRepository;
import mobile_be.mobile_be.Repository.ProjectRepository;
import mobile_be.mobile_be.Repository.UserNoticeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProjectReminderService {

    private final ProjectRepository projectRepository;
    private final NoticeRepository noticeRepository;
    private final UserNoticeRepository userNoticeRepository;

    // Chạy vào đầu mỗi giờ (1:00, 2:00, 3:00, ...)
    @Scheduled(cron = "0 0 * * * *")
    // Chạy mỗi 10 giây một lần
    // @Scheduled(fixedRate = 10000)
    @Transactional
    public void sendProjectReminders() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfTomorrow = today.plusDays(1).atTime(23, 59, 59);
        log.info("Start of today: " + startOfToday);
        log.info("End of tomorrow: " + endOfTomorrow);

        // Lấy danh sách các dự án có thời gian đến hạn trong khoảng thời gian từ đầu hôm nay đến cuối ngày mai
        List<Project> projects = projectRepository.findByToDateBetween(startOfToday, endOfTomorrow);

        for (Project project : projects) {
            if (project.getCreatedBy() != null) {
                log.info("Project ID: " + project.getId());

                String title = "Thông báo dự án";
                String message = "Dự án của bạn '" + project.getName() + "' sẽ đến hạn vào lúc " + project.getToDate();
                String slug = "/projects"+"/"+project.getId();
                Notice notice = new Notice(title, message, slug);
                noticeRepository.save(notice);

                // Chỉ gửi thông báo cho người tạo dự án
                User creator = project.getCreatedBy();
                Integer userId = creator.getId();
                Integer noticeId = notice.getId();

                UserNoticeId userNoticeId = new UserNoticeId(userId, noticeId);
                UserNotice userNotice = new UserNotice(userNoticeId, creator, notice, false);
                userNoticeRepository.save(userNotice);
                
                log.info("Đã tạo thông báo: " + notice.getTitle() + " cho người dùng: " + creator.getName());
            } else {
                log.info("Không tìm thấy người tạo dự án!");
            }
        }
    }
} 