package mobile_be.mobile_be.Service;

import lombok.extern.slf4j.Slf4j;
import mobile_be.mobile_be.Model.*;
import mobile_be.mobile_be.Repository.NoticeRepository;
import mobile_be.mobile_be.Repository.TaskRepository;
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
public class TaskReminderService {

    private final TaskRepository taskRepository;
    private final NoticeRepository noticeRepository;
    private final UserNoticeRepository userNoticeRepository;

    @Scheduled(cron = "0 0 0 * * *") // chạy vào 12:00:00 đêm mỗi ngày
//    @Scheduled(fixedRate = 60 * 1000) // Chạy mỗi 1 giờ
    @Transactional
    public void sendTaskReminders() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfTomorrow = today.plusDays(1).atTime(23, 59, 59);
        log.info("Start of today: " + startOfToday);
        log.info("End of tomorrow: " + endOfTomorrow);
        // Lấy danh sách các nhiệm vụ có thời gian đến hạn trong khoảng thời gian từ đầu hôm nay đến cuối ngày mai
        List<Task> tasks = taskRepository.findByToDateBetween(startOfToday, endOfTomorrow);

        for (Task task : tasks) {
            if (task.getAssignees() != null && !task.getAssignees().isEmpty()) {
                log.info("Task ID nhay vao day : " + task.getId());

                String title = "Task Reminder: " + task.getTitle();
                String message = "Nhiệm vụ của bạn '" + task.getTitle() + "' sẽ đến hạn vào lúc " + task.getToDate();
                String slug = "/tasks"+"/"+task.getId();
                Notice notice = new Notice(title, message,slug);
                noticeRepository.save(notice);
                Integer userId = task.getAssignees().get(0).getId();
                Integer noticeId = notice.getId();

                User user = task.getAssignees().get(0);
                UserNoticeId userNoticeId = new UserNoticeId(userId, noticeId);
                UserNotice userNotice = new UserNotice(userNoticeId, user, notice, false);
                userNoticeRepository.save(userNotice);
            }else {
                System.out.println("Danh sách taskList rỗng!");
            }
        }
    }
}
