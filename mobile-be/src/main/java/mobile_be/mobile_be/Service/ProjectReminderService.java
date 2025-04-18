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
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProjectReminderService {

    private final ProjectRepository projectRepository;
    private final NoticeRepository noticeRepository;
    private final UserNoticeRepository userNoticeRepository;

    // Chạy vào 00:00 mỗi ngày
    @Scheduled(cron = "0 0 0 * * *")
    // Chạy mỗi 10 giây một lần
    // @Scheduled(fixedRate = 10000)
    @Transactional
    public void sendProjectReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = now.toLocalDate().atStartOfDay();
        LocalDateTime endOfTomorrow = now.toLocalDate().plusDays(1).atTime(23, 59, 59);
        log.info("Current time: " + now);
        log.info("Start of today: " + startOfToday);
        log.info("End of tomorrow: " + endOfTomorrow);

        // Lấy danh sách các dự án sắp kết thúc trong khoảng thời gian từ đầu hôm nay đến cuối ngày mai
        List<Project> projectsEndingSoon = projectRepository.findByToDateBetween(startOfToday, endOfTomorrow);
        
        // Lấy danh sách các dự án sắp bắt đầu trong khoảng thời gian từ đầu hôm nay đến cuối ngày mai
        List<Project> projectsStartingSoon = projectRepository.findByFromDateBetween(startOfToday, endOfTomorrow);

        // Gửi thông báo cho các dự án sắp kết thúc
        for (Project project : projectsEndingSoon) {
            if (project.getCreatedBy() != null) {
                log.info("Project ID: " + project.getId() + " sắp kết thúc");

                // Chuyển đổi Date sang LocalDateTime
                Date toDate = project.getToDate();
                LocalDateTime toDateTime = toDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
                
                // Tính số ngày còn lại đến khi kết thúc
                long daysUntilEnd = ChronoUnit.DAYS.between(now, toDateTime);
                
                String title = "Thông báo dự án";
                String message = "Dự án của bạn '" + project.getName() + "' sẽ kết thúc trong " + daysUntilEnd + " ngày nữa";
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
                
                log.info("Đã tạo thông báo kết thúc: " + notice.getTitle() + " cho người dùng: " + creator.getName());
            } else {
                log.info("Không tìm thấy người tạo dự án!");
            }
        }
        
        // Gửi thông báo cho các dự án sắp bắt đầu
        for (Project project : projectsStartingSoon) {
            if (project.getCreatedBy() != null) {
                log.info("Project ID: " + project.getId() + " sắp bắt đầu");

                // Chuyển đổi Date sang LocalDateTime
                Date fromDate = project.getFromDate();
                LocalDateTime fromDateTime = fromDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
                
                // Tính số ngày còn lại đến khi bắt đầu
                long daysUntilStart = ChronoUnit.DAYS.between(now, fromDateTime);
                
                String title = "Thông báo dự án";
                String message = "Dự án của bạn '" + project.getName() + "' sẽ bắt đầu trong " + daysUntilStart + " ngày nữa";
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
                
                log.info("Đã tạo thông báo bắt đầu: " + notice.getTitle() + " cho người dùng: " + creator.getName());
            } else {
                log.info("Không tìm thấy người tạo dự án!");
            }
        }
    }
} 