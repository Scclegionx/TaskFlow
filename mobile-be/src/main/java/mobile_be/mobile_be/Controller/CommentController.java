package mobile_be.mobile_be.Controller;

import mobile_be.mobile_be.DTO.request.CommentRequestDTO;
import mobile_be.mobile_be.Service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    // api tao comment
    @PostMapping("/create-comment")
    public ResponseEntity<?> createComment(@RequestBody CommentRequestDTO commentRequestDTO) {
        var response = commentService.createComment(commentRequestDTO);
        return response;
    }

    // api hien thi comment
    @GetMapping("/get-comment")
    public ResponseEntity<?> getComment(@RequestParam ( value = "taskId", required = false) Integer taskId) {
        var response = commentService.getComment(taskId);
        return response;
    }
}
