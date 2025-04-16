package mobile_be.mobile_be.DTO.response;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TaskHistoryResponseDTO {

    private Integer id;
    private Integer taskId;
    private Integer modifiedBy;
    private LocalDateTime modifiedAt;
    private String data; // chứa JSON của task
    private String modifiedByName;
    private String modifiedByAvatar;


}
