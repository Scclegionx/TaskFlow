package mobile_be.mobile_be.Service;

import lombok.extern.slf4j.Slf4j;
import mobile_be.mobile_be.Model.*;
import mobile_be.mobile_be.Repository.NoticeRepository;
import mobile_be.mobile_be.Repository.ScheduleRepository;
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
public class ScheduleReminderService {

    private final ScheduleRepository scheduleRepository;
    private final NoticeRepository noticeRepository;
    private final UserNoticeRepository userNoticeRepository;

    // Chạy vào đầu mỗi giờ (1:00, 2:00, 3:00, ...)
    @Scheduled(cron = "0 0 * * * *")
    // Chạy mỗi 10 giây một lần
    // @Scheduled(fixedRate = 10000)
    @Transactional
    public void sendScheduleReminders() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfTomorrow = today.plusDays(1).atTime(23, 59, 59);
        log.info("Start of today: " + startOfToday);
        log.info("End of tomorrow: " + endOfTomorrow);

        // Lấy danh sách các lịch có thời gian đến hạn trong khoảng thời gian từ đầu hôm nay đến cuối ngày mai
        List<Schedule> schedules = scheduleRepository.findByToDateBetween(startOfToday, endOfTomorrow);

        for (Schedule schedule : schedules) {
            if (schedule.getParticipants() != null && !schedule.getParticipants().isEmpty()) {
                log.info("Schedule ID: " + schedule.getId());

                String title = "Thông báo lịch trình";
                String message = "Lịch của bạn '" + schedule.getTitle() + "' sẽ đến hạn vào lúc " + schedule.getEndTime();
                String slug = "/schedules"+"/"+schedule.getId();
                Notice notice = new Notice(title, message, slug);
                noticeRepository.save(notice);
                
                // Gửi thông báo cho tất cả người tham gia lịch
                for (ScheduleParticipants participant : schedule.getParticipants()) {
                    User user = participant.getUser();
                    Integer userId = user.getId();
                    Integer noticeId = notice.getId();

                    UserNoticeId userNoticeId = new UserNoticeId(userId, noticeId);
                    UserNotice userNotice = new UserNotice(userNoticeId, user, notice, false);
                    userNoticeRepository.save(userNotice);
                    
                    log.info("Đã tạo thông báo: " + notice.getTitle() + " cho người dùng: " + user.getName());
                }
            } else {
                log.info("Danh sách người tham gia lịch rỗng!");
            }
        }
    }
} 