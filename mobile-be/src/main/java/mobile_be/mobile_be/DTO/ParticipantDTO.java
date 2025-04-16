package mobile_be.mobile_be.DTO;

import lombok.Data;
import mobile_be.mobile_be.Model.ScheduleParticipants;

@Data
public class ParticipantDTO {
    private Long id;
    private UserDTO user;
    private String avatar;

    public static ParticipantDTO fromEntity(ScheduleParticipants participant) {
        ParticipantDTO dto = new ParticipantDTO();
        dto.setId(participant.getId());
        if (participant.getUser() != null) {
            dto.setUser(UserDTO.fromEntity(participant.getUser()));
        }
        return dto;
    }
} 