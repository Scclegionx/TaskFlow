package mobile_be.mobile_be.Controller;

import mobile_be.mobile_be.Model.Schedule;
import mobile_be.mobile_be.Service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {
    @Autowired
    private ScheduleService scheduleService;

    @PostMapping
    public Schedule createSchedule(@RequestBody Schedule schedule) {
        return scheduleService.createSchedule(schedule);
    }

    @GetMapping
    public List<Schedule> getSchedulesByDate(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return scheduleService.getSchedulesByDate(date);
    }

    @GetMapping("/highlighted-dates")
    public Map<String, String> getHighlightedDates() {
        return scheduleService.getHighlightedDates();
    }
}
