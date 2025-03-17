package mobile_be.mobile_be.Controller;

import lombok.RequiredArgsConstructor;
import mobile_be.mobile_be.Service.TaskReminderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestController {

    private final TaskReminderService taskReminderService;

    @GetMapping("/trigger-reminder")
    public ResponseEntity<String> triggerReminder() {
        taskReminderService.sendTaskReminders();
        return ResponseEntity.ok("Task reminder triggered successfully.");
    }
}
