package mobile_be.mobile_be.Service;

import mobile_be.mobile_be.DTO.ScheduleDTO;
import mobile_be.mobile_be.Model.Schedule;
import mobile_be.mobile_be.Model.ScheduleParticipants;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.ScheduleRepository;
import mobile_be.mobile_be.Repository.ScheduleParticipantsRepository;
import mobile_be.mobile_be.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ScheduleService {
    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private ScheduleParticipantsRepository scheduleParticipantsRepository;

    @Autowired
    private UserRepository userRepository;

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    @Transactional
    public Schedule createScheduleFromRequest(Map<String, Object> request) {
        Schedule schedule = new Schedule();
        schedule.setTitle((String) request.get("title"));
        
        // Parse datetime với timezone
        String startTimeStr = (String) request.get("startTime");
        String endTimeStr = (String) request.get("endTime");
        
        schedule.setStartTime(parseDateTime(startTimeStr));
        schedule.setEndTime(parseDateTime(endTimeStr));
        
        schedule.setPriority(Schedule.Priority.valueOf((String) request.get("priority")));
        schedule.setContent((String) request.get("content"));
        
        // Lấy user_id từ request và set vào schedule
        @SuppressWarnings("unchecked")
        Map<String, Object> userMap = (Map<String, Object>) request.get("user");
        if (userMap != null && userMap.containsKey("id")) {
            Integer userId = (Integer) userMap.get("id");
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                schedule.setUser(user);
            }
        }
        
        @SuppressWarnings("unchecked")
        List<Integer> participantIds = (List<Integer>) request.get("participants");
        
        return createSchedule(schedule, participantIds);
    }

    private LocalDateTime parseDateTime(String dateTimeStr) {
        // Loại bỏ timezone nếu có
        if (dateTimeStr.endsWith("Z")) {
            dateTimeStr = dateTimeStr.substring(0, dateTimeStr.length() - 1);
        }
        return LocalDateTime.parse(dateTimeStr, DATE_TIME_FORMATTER);
    }

    @Transactional
    public Optional<Schedule> updateScheduleFromRequest(Long id, Map<String, Object> request) {
        return scheduleRepository.findById(id).map(schedule -> {
            schedule.setTitle((String) request.get("title"));
            
            String startTimeStr = (String) request.get("startTime");
            String endTimeStr = (String) request.get("endTime");
            
            schedule.setStartTime(parseDateTime(startTimeStr));
            schedule.setEndTime(parseDateTime(endTimeStr));
            
            schedule.setPriority(Schedule.Priority.valueOf((String) request.get("priority")));
            schedule.setContent((String) request.get("content"));

            // Xóa tất cả participants cũ
            schedule.getParticipants().clear();

            // Thêm participants mới
            @SuppressWarnings("unchecked")
            List<Integer> participantIds = (List<Integer>) request.get("participants");
            if (participantIds != null && !participantIds.isEmpty()) {
                for (Integer userId : participantIds) {
                    User user = userRepository.findById(userId).orElse(null);
                    if (user != null) {
                        ScheduleParticipants participant = new ScheduleParticipants();
                        participant.setSchedule(schedule);
                        participant.setUser(user);
                        schedule.getParticipants().add(participant);
                    }
                }
            }

            return scheduleRepository.save(schedule);
        });
    }

    @Transactional
    public Schedule createSchedule(Schedule schedule, List<Integer> participantIds) {
        Schedule savedSchedule = scheduleRepository.save(schedule);
        
        if (participantIds != null && !participantIds.isEmpty()) {
            for (Integer userId : participantIds) {
                User user = userRepository.findById(userId).orElse(null);
                if (user != null) {
                    ScheduleParticipants participant = new ScheduleParticipants();
                    participant.setSchedule(savedSchedule);
                    participant.setUser(user);
                    scheduleParticipantsRepository.save(participant);
                }
            }
        }
        
        return savedSchedule;
    }

    public Page<Schedule> getSchedulesByDate(LocalDate date, Integer userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(
            Sort.Order.desc("priority"),
            Sort.Order.asc("startTime")
        ));
        return scheduleRepository.findSchedulesByDateAndUserId(date, userId, pageable);
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

    public boolean deleteSchedule(Long id) {
        if (scheduleRepository.existsById(id)) {
            scheduleRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Optional<ScheduleDTO> getScheduleById(Long id) {
        return scheduleRepository.findByIdWithParticipants(id)
            .map(ScheduleDTO::fromEntity);
    }

    public List<Map<String, Object>> searchSchedules(String query, Integer userId) {
        List<Schedule> schedules = scheduleRepository.searchSchedules(query, userId);
        return schedules.stream().map(schedule -> {
            Map<String, Object> result = new HashMap<>();
            result.put("id", schedule.getId());
            result.put("title", schedule.getTitle());
            return result;
        }).collect(Collectors.toList());
    }
}
