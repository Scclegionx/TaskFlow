package mobile_be.mobile_be.DTO.response;

import lombok.Data;

@Data
public class CommentResponseDTO {
    private String content;
    private Integer userId;
    private Integer taskId;
    private String date;
    private Integer id;
    private String userName;
}
