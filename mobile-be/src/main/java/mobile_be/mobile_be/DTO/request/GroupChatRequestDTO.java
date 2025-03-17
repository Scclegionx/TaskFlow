package mobile_be.mobile_be.DTO.request;

import java.util.List;


public record GroupChatRequestDTO(List<Integer> userIds, String chatName) {
}
