package mobile_be.mobile_be.Controller;

import mobile_be.mobile_be.DTO.ScheduleDTO;
import mobile_be.mobile_be.Model.Schedule;
import mobile_be.mobile_be.Service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {
    @Autowired
    private ScheduleService scheduleService;

    @PostMapping
    public Schedule createSchedule(@RequestBody Map<String, Object> request) {
        return scheduleService.createScheduleFromRequest(request);
    }

    @GetMapping
    public ResponseEntity<?> getSchedulesByDate(
        @RequestParam String date,
        @RequestParam Integer userId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "5") int size
    ) {
        LocalDate parsedDate = LocalDate.parse(date);
        Page<Schedule> schedules = scheduleService.getSchedulesByDate(parsedDate, userId, page, size);
        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/highlighted-dates")
    public ResponseEntity<?> getHighlightedDates(@RequestParam Integer userId) {
        Map<String, String> highlightedDates = scheduleService.getHighlightedDates(userId);
        return ResponseEntity.ok(highlightedDates);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSchedule(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Optional<Schedule> updated = scheduleService.updateScheduleFromRequest(id, request);
        return updated.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSchedule(@PathVariable Long id) {
        if (scheduleService.deleteSchedule(id)) {
            return ResponseEntity.ok("Lịch trình đã bị xóa thành công!");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScheduleDTO> getScheduleById(@PathVariable Long id) {
        Optional<ScheduleDTO> schedule = scheduleService.getScheduleById(id);
        return schedule.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchSchedules(@RequestParam String query, @RequestParam Integer userId) {
        return ResponseEntity.ok(scheduleService.searchSchedules(query, userId));
    }
}
