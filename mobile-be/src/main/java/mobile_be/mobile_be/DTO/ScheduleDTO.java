package mobile_be.mobile_be.DTO;

import lombok.Data;
import mobile_be.mobile_be.Model.Schedule;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class ScheduleDTO {
    private Long id;
    private String title;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Schedule.Priority priority;
    private String content;
    private UserDTO user;
    private List<ParticipantDTO> participants;

    public static ScheduleDTO fromEntity(Schedule schedule) {
        ScheduleDTO dto = new ScheduleDTO();
        dto.setId(schedule.getId());
        dto.setTitle(schedule.getTitle());
        dto.setStartTime(schedule.getStartTime());
        dto.setEndTime(schedule.getEndTime());
        dto.setPriority(schedule.getPriority());
        dto.setContent(schedule.getContent());
        
        if (schedule.getUser() != null) {
            dto.setUser(UserDTO.fromEntity(schedule.getUser()));
        }
        
        if (schedule.getParticipants() != null) {
            dto.setParticipants(schedule.getParticipants().stream()
                .map(ParticipantDTO::fromEntity)
                .collect(Collectors.toList()));
        }
        
        return dto;
    }
} 