package mobile_be.mobile_be.DTO.response;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import org.springframework.boot.convert.DataSizeUnit;

import java.time.LocalDateTime;

@Data
public class ChamCongResponseDTO {

    private Integer id;

    private Integer user_id;

    private String checkin;

    private String checkout;

    private int status;

    private float total_hours;

    private String username;

    private String avatar;
}
