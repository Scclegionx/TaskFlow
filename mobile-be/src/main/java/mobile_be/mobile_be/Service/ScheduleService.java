package mobile_be.mobile_be.Service;

import mobile_be.mobile_be.Model.Schedule;
import mobile_be.mobile_be.Repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ScheduleService {
    @Autowired
    private ScheduleRepository scheduleRepository;

    public Schedule createSchedule(Schedule schedule) {
        return scheduleRepository.save(schedule);
    }

    public List<Schedule> getSchedulesByDate(LocalDate date, Integer userId) {
        return scheduleRepository.findSchedulesByDateAndUserId(date, userId);
    }

    public Map<String, String> getHighlightedDates(Integer userId) {
        List<Object[]> result = scheduleRepository.findHighlightedDatesByUserId(userId);
        Map<String, String> highlightedDates = new HashMap<>();

        for (Object[] row : result) {
            LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
            int priority = ((Number) row[1]).intValue();
            System.out.println(priority);
            // Xác định màu dựa vào priority
            String color = determineColor(priority);
            highlightedDates.put(date.toString(), color);
        }
        return highlightedDates;
    }

    private String determineColor(int priority) {
        return switch (priority) {
            case 2 -> "HIGH";
            case 1 -> "NORMAL";
            case 0 -> "LOW";
            default -> "highlighted";
        };
    }
    public Optional<Schedule> updateSchedule(Long id, Schedule updatedSchedule) {
        return scheduleRepository.findById(id).map(schedule -> {
            schedule.setTitle(updatedSchedule.getTitle());
            schedule.setStartTime(updatedSchedule.getStartTime());
            schedule.setEndTime(updatedSchedule.getEndTime());
            schedule.setPriority(updatedSchedule.getPriority());

            return scheduleRepository.save(schedule);
        });
    }

    public boolean deleteSchedule(Long id) {
        if (scheduleRepository.existsById(id)) {
            scheduleRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Optional<Schedule> getScheduleById(Long id) {
        return scheduleRepository.findById(id);
    }

}
