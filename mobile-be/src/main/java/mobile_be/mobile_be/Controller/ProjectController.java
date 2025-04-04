package mobile_be.mobile_be.Controller;

import lombok.RequiredArgsConstructor;
import mobile_be.mobile_be.DTO.CreateProjectRequest;
import mobile_be.mobile_be.DTO.response.ProjectResponseDTO;
import mobile_be.mobile_be.Model.Project;
import mobile_be.mobile_be.Service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;


import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;

    @PostMapping("/create-project")
    public ResponseEntity<Project> createProject(@RequestBody CreateProjectRequest request) {
        System.out.println("Received request: " + request);
        Project project = projectService.createProject(request);
        return ResponseEntity.ok(project);
    }

    // api lay so luong  du an , cong viec, thanh vien hien thi o giao dien home
    // chi user duoc join du an thi moi tinh
    @GetMapping("/get-number-project-task-member")
    public ResponseEntity<Map<String , Integer>> getNumberProjectAndTask() {
        return ResponseEntity.ok(projectService.getNumberProjectAndTask());
    }

    // api lay ra so luong du an theo trang thai
    // bieu do tron o home
    @GetMapping("/get-number-project-by-status")
    public ResponseEntity<Map<String, Integer>> getNumberProjectByStatus(@RequestParam(value = "projectId", required = false) Integer projectId,
                                                                         @RequestParam(value = "type", required = false) Integer type,
                                                                         @RequestParam(value = "userId", required = false) Integer userId) {
        return ResponseEntity.ok(projectService.getNumberProjectByStatus(projectId, type, userId));
    }

    // api lay ra danh sach cac du an
    //api lấy ra dự án theo tên , id
    @GetMapping("/get-all-project")
    public ResponseEntity<?> getAllProject(@RequestParam(value ="name", required = false) String name,
                                           @RequestParam(value = "projectId", required = false) Integer projectId) {
        return ResponseEntity.ok(projectService.getAllProject(name,projectId));
    }
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponseDTO> getProjectById(@PathVariable Integer id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }



    // api lay ra cac cong viec của du an
    // lay all cong viec trong he thong luon
    // man hinh tat ca cong viec
    @GetMapping("/get-all-task-in-project")
    public ResponseEntity<?> getAllTaskInProject(@RequestParam(value = "projectId", required = false) Integer projectId,
                                                 @RequestParam(value = "userId", required = false) Integer userId,
                                                 @RequestParam(value = "type", required = false) Integer type,
                                                 @RequestParam(value = "textSearch", required = false) String textSearch) {
        return ResponseEntity.ok(projectService.getAllTaskInProject(projectId, userId, type, textSearch));
    }

    @GetMapping("/get-project")
        public ResponseEntity<?> getProject() {
            return ResponseEntity.ok(projectService.getProject());
        }

    // api lay ra  nhan su cua du an
    // api lay ra nhan su cho ca he thong
    @GetMapping("/get-all-member-in-project")
    public ResponseEntity<?> getAllMemberInProject(@RequestParam(value = "projectId", required = false) Integer projectId,
                                                   @RequestParam(value = "textSearch", required = false) String textSearch) {
        return ResponseEntity.ok(projectService.getAllMemberInProject(projectId, textSearch));
    }



}
