package mobile_be.mobile_be.DTO.response;

import lombok.Builder;

@Builder
public record ApiResponseDTO(String message, boolean status) {
}
