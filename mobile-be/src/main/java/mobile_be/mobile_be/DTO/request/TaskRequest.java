package mobile_be.mobile_be.DTO.request;

import jakarta.persistence.*;
import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.Data;
import mobile_be.mobile_be.Model.Project;
import mobile_be.mobile_be.Model.User;

import java.time.LocalDateTime;

@Data
public class TaskRequest {
    private Integer projectId;
    private Integer assignedTo;
    private String title;
    private String description;
    private LocalDateTime deadline;
    private Integer status;
}
