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
import java.time.temporal.ChronoUnit;
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
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = now.toLocalDate().atStartOfDay();
        LocalDateTime endOfTomorrow = now.toLocalDate().plusDays(1).atTime(23, 59, 59);
        log.info("Current time: " + now);
        log.info("Start of today: " + startOfToday);
        log.info("End of tomorrow: " + endOfTomorrow);

        // Lấy danh sách các lịch có thời gian đến hạn trong khoảng thời gian từ đầu hôm nay đến cuối ngày mai
        List<Schedule> schedules = scheduleRepository.findByToDateBetween(startOfToday, endOfTomorrow);

        for (Schedule schedule : schedules) {
            // Chỉ gửi thông báo cho các lịch trình chưa diễn ra
            if (schedule.getEndTime().isAfter(now)) {
                if (schedule.getParticipants() != null && !schedule.getParticipants().isEmpty()) {
                    log.info("Schedule ID: " + schedule.getId() + " sẽ diễn ra từ " + schedule.getStartTime() + " đến " + schedule.getEndTime());

                    // Tính số giờ và phút còn lại đến khi bắt đầu
                    long hoursUntilStart = ChronoUnit.HOURS.between(now, schedule.getStartTime());
                    long minutesUntilStart = ChronoUnit.MINUTES.between(now, schedule.getStartTime()) % 60;
                    
                    String title = "Thông báo lịch trình";
                    String message;
                    if (hoursUntilStart > 0) {
                        message = "Lịch của bạn '" + schedule.getTitle() + "' sẽ bắt đầu trong " + hoursUntilStart + " giờ " + minutesUntilStart + " phút nữa";
                    } else {
                        message = "Lịch của bạn '" + schedule.getTitle() + "' sẽ bắt đầu trong " + minutesUntilStart + " phút nữa";
                    }
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
            } else {
                log.info("Schedule ID: " + schedule.getId() + " đã qua thời gian diễn ra, không gửi thông báo");
            }
        }
    }
} 