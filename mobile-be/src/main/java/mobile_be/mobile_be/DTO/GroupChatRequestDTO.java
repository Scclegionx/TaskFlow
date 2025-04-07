package mobile_be.mobile_be.DTO;

import lombok.Getter;
import lombok.Setter;

import java.util.Set;
@Getter
@Setter
public class GroupChatRequestDTO {
    private String groupName;
    private Set<Integer> userIds;
}
