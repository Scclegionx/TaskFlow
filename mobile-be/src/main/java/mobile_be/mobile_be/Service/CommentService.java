package mobile_be.mobile_be.Service;

import lombok.extern.slf4j.Slf4j;
import mobile_be.mobile_be.DTO.request.CommentRequestDTO;
import mobile_be.mobile_be.DTO.response.CommentResponseDTO;
import mobile_be.mobile_be.Mapper.CommentMapper;
import mobile_be.mobile_be.Model.Comment;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.CommentRepository;
import mobile_be.mobile_be.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    public ResponseEntity<?> createComment(CommentRequestDTO commentRequestDTO){

        try {
            LocalDateTime currentDateTime = LocalDateTime.now();
            Comment comment = new Comment();
            comment.setContent(commentRequestDTO.getContent());
            comment.setDate(currentDateTime);
            comment.setUserId(commentRequestDTO.getUserId());
            comment.setTaskId(commentRequestDTO.getTaskId());

            var response = commentRepository.save(comment);

            CommentResponseDTO commentResponseDTO = CommentMapper.INSTANCE.toDTO(response);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            if (response.getUserId() != null){
                User user = userRepository.findById(response.getUserId()).orElseThrow(() -> new RuntimeException("User not found"));
                commentResponseDTO.setUserName(user.getName());
            }

            commentResponseDTO.setDate(comment.getDate().format(formatter));

            return ResponseEntity.ok(commentResponseDTO);

        }catch( Exception e){
            log.error(e.toString());
            return ResponseEntity.badRequest().body("tao that bai");
        }
    }

    public ResponseEntity<?> getComment(Integer taskId){
        try {

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            var response = commentRepository.findByTaskId(taskId);

            List<CommentResponseDTO> results = response.stream().map(
                    comment ->{
                        CommentResponseDTO commentResponseDTO = CommentMapper.INSTANCE.toDTO(comment);

                        if (comment.getUserId() != null){
                            User user = userRepository.findById(comment.getUserId()).orElseThrow(() -> new RuntimeException("User not found"));
                            commentResponseDTO.setUserName(user.getName());
                        }

                        commentResponseDTO.setDate(comment.getDate().format(formatter));

                        return commentResponseDTO;
                    }
            ).collect(Collectors.toList());

            return ResponseEntity.ok(results);
        }catch( Exception e){
            log.error(e.toString());
            return ResponseEntity.badRequest().body("lay comment that bai");
        }
    }
}
