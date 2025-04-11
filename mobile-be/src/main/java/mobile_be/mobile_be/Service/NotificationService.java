package mobile_be.mobile_be.Service;

import mobile_be.mobile_be.DTO.NotificationResponse;
import mobile_be.mobile_be.Model.Notice;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Model.UserNotice;
import mobile_be.mobile_be.Model.UserNoticeId;
import mobile_be.mobile_be.Repository.NoticeRepository;
import mobile_be.mobile_be.Repository.UserNoticeRepository;
import mobile_be.mobile_be.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NoticeRepository noticeRepository;
    private final UserNoticeRepository userNoticeRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(Integer userId) {
        List<UserNotice> userNotices = userNoticeRepository.findByUserId(userId);

        return userNotices.stream()
                .map(notice -> NotificationResponse.builder()
                        .id(notice.getNotice().getId())
                        .title(notice.getNotice().getTitle())
                        .message(notice.getNotice().getMessage())
                        .isRead(notice.isRead())
                        .slug(notice.getNotice().getSlug())
                        .createdAt(notice.getNotice().getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Async
    @Transactional
    public void sendNotification(Integer userId, String message,String slug) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        // Tạo thông báo mới
        Notice notice = new Notice();
        notice.setTitle("Thông báo công việc");
        notice.setMessage(message);
        notice.setCreatedAt(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant());
        notice.setSlug(slug);
        notice = noticeRepository.save(notice);
        UserNoticeId userNoticeId = new UserNoticeId(user.getId(), notice.getId());

        UserNotice userNotice = new UserNotice();
        userNotice.setId(userNoticeId);
        userNotice.setUser(user);
        userNotice.setNotice(notice);
        userNotice.setRead(false);

        userNoticeRepository.save(userNotice);
    }
}
