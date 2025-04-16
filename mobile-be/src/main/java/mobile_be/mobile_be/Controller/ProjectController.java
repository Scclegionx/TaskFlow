package mobile_be.mobile_be.Controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mobile_be.mobile_be.DTO.CreateProjectRequest;
import mobile_be.mobile_be.DTO.response.ProjectResponseDTO;
import mobile_be.mobile_be.DTO.request.UpdateProjectRequest;
import mobile_be.mobile_be.DTO.response.TaskResponseDTO;
import mobile_be.mobile_be.DTO.response.UserResponseDTO;
import mobile_be.mobile_be.Model.Project;
import mobile_be.mobile_be.Model.Task;
import mobile_be.mobile_be.Service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Slf4j
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
    public ResponseEntity<ProjectResponseDTO> getProjectById(
        @PathVariable Integer id,
        @RequestParam(defaultValue = "0") Integer memberPage,
        @RequestParam(defaultValue = "3") Integer memberSize,
        @RequestParam(defaultValue = "0") Integer taskPage,
        @RequestParam(defaultValue = "5") Integer taskSize) {
        return ResponseEntity.ok(projectService.getProjectById(id, memberPage, memberSize, taskPage, taskSize));
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
    public ResponseEntity<?> getProject(
        @RequestParam(required = false) Integer userId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "5") int size) {
        return ResponseEntity.ok(projectService.getProject(userId, page, size));
    }

    // api lay ra  nhan su cua du an
    // api lay ra nhan su cho ca he thong
    @GetMapping("/get-all-member-in-project")
    public ResponseEntity<?> getAllMemberInProject(@RequestParam(value = "projectId", required = false) Integer projectId,
                                                   @RequestParam(value = "textSearch", required = false) String textSearch) {
        return ResponseEntity.ok(projectService.getAllMemberInProject(projectId, textSearch));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(
            @PathVariable Integer id,
            @RequestBody UpdateProjectRequest request,
            @RequestParam Integer userId) {
        try {
            System.out.println(request);
            ProjectResponseDTO updatedProject = projectService.updateProject(id, request, userId);
            return ResponseEntity.ok(updatedProject);
        } catch (IllegalAccessException e) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Bạn không có quyền sửa dự án này");
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Không tìm thấy dự án");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(
            @PathVariable Integer id,
            @RequestParam Integer userId) {
        try {
            projectService.deleteProject(id, userId);
            return ResponseEntity.ok("Xóa dự án thành công");
        } catch (IllegalAccessException e) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Bạn không có quyền xóa dự án này");
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Không tìm thấy dự án");
        }
    }

    @PostMapping("/{projectId}/members")
    public ResponseEntity<?> addProjectMember(
            @PathVariable Integer projectId,
            @RequestBody Map<String, Integer> request) {
        try {
            Integer userId = request.get("userId");
            projectService.addProjectMember(projectId, userId);
            return ResponseEntity.ok("Thêm thành viên thành công");
        } catch (IllegalAccessException e) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Bạn không có quyền thêm thành viên vào dự án này");
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    @DeleteMapping("/{projectId}/members/{memberId}")
    public ResponseEntity<?> removeProjectMember(
            @PathVariable Integer projectId,
            @PathVariable Integer memberId,
            @RequestParam Integer userId) {
        try {
            System.out.println("Removing member: ProjectID=" + projectId + ", MemberID=" + memberId + ", CurrentUserID=" + userId);
            projectService.removeProjectMember(projectId, memberId, userId);
            System.out.println("Member removed successfully");
            return ResponseEntity.ok("Xóa thành viên thành công");
        } catch (IllegalAccessException e) {
            System.err.println("Permission error: " + e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        } catch (RuntimeException e) {
            System.err.println("Runtime error: " + e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProjects(@RequestParam String query) {
        return ResponseEntity.ok(projectService.searchProjects(query));
    }

    @GetMapping("/{projectId}/search-members")
    public ResponseEntity<List<UserResponseDTO>> searchMembersInProject(
        @PathVariable Integer projectId,
        @RequestParam(required = false) String searchText) {
        return ResponseEntity.ok(projectService.searchMembersInProject(projectId, searchText));
    }

    @GetMapping("/{projectId}/search-tasks")
    public ResponseEntity<List<TaskResponseDTO>> searchTasksInProject(
        @PathVariable Integer projectId,
        @RequestParam(required = false) String searchText) {
        return ResponseEntity.ok(projectService.searchTasksInProject(projectId, searchText));
    }

    @GetMapping("/{projectId}/members")
    public ResponseEntity<List<UserResponseDTO>> getProjectMembers(@PathVariable Integer projectId) {
        return ResponseEntity.ok(projectService.getProjectMembers(projectId));
    }
}
