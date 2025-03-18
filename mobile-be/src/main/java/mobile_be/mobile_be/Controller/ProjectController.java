package mobile_be.mobile_be.Controller;

import lombok.RequiredArgsConstructor;
import mobile_be.mobile_be.DTO.CreateProjectRequest;
import mobile_be.mobile_be.Model.Project;
import mobile_be.mobile_be.Service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody CreateProjectRequest request) {
        Project project = projectService.createProject(request);
        return ResponseEntity.ok(project);
    }

    // api lay so luong  du an , cong viec, thanh vien hien thi o giao dien home
    @GetMapping("/get-number-project-task-member")
    public ResponseEntity<Map<String , Integer>> getNumberProjectAndTask() {
        return ResponseEntity.ok(projectService.getNumberProjectAndTask());
    }


}
