package mobile_be.mobile_be.DTO.response;

import lombok.Data;

import java.time.LocalDate;

@Data
public class RatingResponseDTO {
    private Integer id;
    private Integer userId;
    private String content;
    private Integer createdBy;
    private Integer star;
    private LocalDate createdAt;

    private String avatar;
    private String createdByName;

    private float averageStar;

}
