package mobile_be.mobile_be.DTO.request;

import lombok.Data;

@Data
public class CommentRequestDTO {
    private String content;
    private Integer userId;
    private Integer taskId;

}
