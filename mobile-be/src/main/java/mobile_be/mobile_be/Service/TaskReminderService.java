package mobile_be.mobile_be.Service;

import mobile_be.mobile_be.Model.*;
import mobile_be.mobile_be.Repository.NoticeRepository;
import mobile_be.mobile_be.Repository.TaskRepository;
import mobile_be.mobile_be.Repository.UserNoticeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskReminderService {

    private final TaskRepository taskRepository;
    private final NoticeRepository noticeRepository;
    private final UserNoticeRepository userNoticeRepository;

    @Scheduled(fixedRate = 3600000) // Chạy mỗi 1 giờ
    @Transactional
    public void sendTaskReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sixHoursLater = now.plusHours(6);

        // Lấy danh sách các task có deadline trong vòng 6 giờ
        List<Task> tasks = taskRepository.findByDeadlineBetween(now, sixHoursLater);

        for (Task task : tasks) {
            if (task.getAssignedTo() != null) {
                String title = "Task Reminder: " + task.getTitle();
                String message = "Nhiệm vụ của bạn '" + task.getTitle() + "' sẽ đến hạn vào lúc " + task.getDeadline();
                Notice notice = new Notice(title, message);
                noticeRepository.save(notice);
                Integer userId = task.getAssignedTo().getId(); 
                Integer noticeId = notice.getId(); 

                User user = task.getAssignedTo();
                UserNoticeId userNoticeId = new UserNoticeId(userId, noticeId);
                UserNotice userNotice = new UserNotice(userNoticeId, user, notice, false);
                userNoticeRepository.save(userNotice);
            }
        }
    }
}
