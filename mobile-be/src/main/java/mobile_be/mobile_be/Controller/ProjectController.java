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
        Project project = projectService.createProject(request);
        return ResponseEntity.ok(project);
    }

    // api lay so luong  du an , cong viec, thanh vien hien thi o giao dien home
    @GetMapping("/get-number-project-task-member")
    public ResponseEntity<Map<String , Integer>> getNumberProjectAndTask() {
        return ResponseEntity.ok(projectService.getNumberProjectAndTask());
    }

    // api lay ra so luong du an theo trang thai
    @GetMapping("/get-number-project-by-status")
    public ResponseEntity<Map<String, Integer>> getNumberProjectByStatus() {
        return ResponseEntity.ok(projectService.getNumberProjectByStatus());
    }

    // api lay ra danh sach cac du an
    @GetMapping("/get-all-project")
    public ResponseEntity<?> getAllProject() {
        return ResponseEntity.ok(projectService.getAllProject());
    }
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponseDTO> getProjectById(@PathVariable Integer id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }


}
