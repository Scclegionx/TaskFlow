package mobile_be.mobile_be.Controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.transaction.Transactional;
import mobile_be.mobile_be.Model.Document;
import mobile_be.mobile_be.Model.Kpi;
import mobile_be.mobile_be.Model.Task;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.DocumentRepository;
import mobile_be.mobile_be.Repository.KpiRepository;
import mobile_be.mobile_be.Repository.TaskRepository;
import mobile_be.mobile_be.Repository.UserRepository;
import mobile_be.mobile_be.Service.DepartmentService;
import mobile_be.mobile_be.Service.ExcelGenerator;
import mobile_be.mobile_be.Service.UserService;
import mobile_be.mobile_be.contains.enum_tydstate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Controller
@RequestMapping("/api/document")
public class DocumentController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private KpiRepository kpiRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    DepartmentService departmentService;


    @GetMapping("/download-excel-user")
    public ResponseEntity<Resource> downloadExcelUser() throws IOException {
        String[] headers = {"ID", "Tên", "Email", "Giới tính", "Ngày sinh"};

        List<User> users = userRepository.getListUser();
        List<String[]> data = Arrays.asList(
                users.stream().map(user -> new String[]{
                        String.valueOf(user.getId()),
                        user.getName(),
                        user.getEmail(),
                        String.valueOf(user.getGender()),
                        String.valueOf(user.getDateOfBirth())
                }).toArray(String[][]::new)
        );

        byte[] excelBytes = ExcelGenerator.generateExcel(data, headers);

        ByteArrayResource resource = new ByteArrayResource(excelBytes);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Nhân_sự.xlsx")
                .body(resource);
    }


    @GetMapping("/download-excel-kpi")
    public ResponseEntity<Resource> downloadExcelKpi() throws IOException {
        String[] headers = {"Nhân sự", "Điểm cộng", "Điểm trừ", "Tổng điểm", "Thời gian"};

        String time = "";
        LocalDate today = LocalDate.now();
        time = today.format(DateTimeFormatter.ofPattern("yyyy-MM"));

        List<Kpi> kpis = kpiRepository.getKpiByMonth(null, null, "");
        List<String[]> data = Arrays.asList(
                kpis.stream().map(kpi -> new String[]{

                        String.valueOf(userRepository.findById(kpi.getUserId()).get().getName()),

                        String.valueOf(kpi.getPlusPoint()),
                        String.valueOf((kpi.getMinusPoint())),
                        String.valueOf(kpi.getTotalPoint()),

                        String.valueOf(kpi.getTime())
                }).toArray(String[][]::new)
        );

        byte[] excelBytes = ExcelGenerator.generateExcel(data, headers);

        ByteArrayResource resource = new ByteArrayResource(excelBytes);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=KPI.xlsx")
                .body(resource);
    }


    @GetMapping("/download-excel-cham-cong")
    public ResponseEntity<Resource> downloadExcelChamCong(@RequestParam(value = "startDate", required = false) String startDate,
                                                          @RequestParam(value = "endDate", required = false) String endDate,
                                                          @RequestParam(value = "textSearch", required = false) String textSearch) throws IOException {
        String[] headers = {"Nhân sự", "Giờ đến", "Giờ về", "Số giờ làm việc", "Trạng thái"};

        var results = userService.getTydstate(startDate, endDate, textSearch);
        List<String[]> data = Arrays.asList(
                results.stream().map(tydstate -> new String[]{
                        String.valueOf(userRepository.findById(tydstate.getUser_id()).get().getName()),
                        String.valueOf(tydstate.getCheckin()),
                        String.valueOf(tydstate.getCheckout()),
                        String.valueOf(tydstate.getTotal_hours()),
                        tydstate.getStatus() == enum_tydstate.DiMuon.getValue() ? "Đi muộn" :
                                tydstate.getStatus() == enum_tydstate.Du.getValue() ? "Đủ" :
                                        tydstate.getStatus() == enum_tydstate.VeSom.getValue() ? "Về sớm" :
                                                tydstate.getStatus() == enum_tydstate.DiMuonVeSom.getValue() ? "Đi muộn về sớm" :
                                                        "Không xác định" // Trường hợp khác
                }).toArray(String[][]::new)
        );

        byte[] excelBytes = ExcelGenerator.generateExcel(data, headers);

        ByteArrayResource resource = new ByteArrayResource(excelBytes);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ChamCong.xlsx")
                .body(resource);
    }


    @GetMapping("/download-excel-phong-ban")
    public ResponseEntity<Resource> downloadExcelPhongBan() throws IOException {
        String[] headers = {"Tên phòng", "Trưởng phòng", "Tổng số tổ", "Tổng số nhân sự"};

        var results = departmentService.getAllDepartment(null, null);

        List<String[]> data = Arrays.asList(
                results.stream().map(department -> new String[]{
                        String.valueOf(department.getName()),
                        String.valueOf(department.getLeader().getName()),
                        String.valueOf(department.getTeams().size()),
                        String.valueOf(
                                department.getTeams().stream()
                                        .flatMap(team -> team.getMembers().stream())
                                        .filter(member -> member.getStatus() == 1)
                                        .map(member -> member.getUser().getId())
                                        .distinct()
                                        .count()
                        )
                }).toArray(String[][]::new)
        );

        byte[] excelBytes = ExcelGenerator.generateExcel(data, headers);

        ByteArrayResource resource = new ByteArrayResource(excelBytes);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=PhongBan.xlsx")
                .body(resource);
    }


    @PostMapping("/upload/task/{taskId}")
    public ResponseEntity<List<Document>> uploadMultipleFiles(
            @PathVariable("taskId") Integer taskId,
            @RequestParam("files") MultipartFile[] files) {

        Task task = taskRepository.findById(taskId);
        if (task == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        List<Document> savedDocuments = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
                String mimeType = file.getContentType();
                String resourceType = "auto";
                String attachmentType = "raw";

                if (mimeType != null && mimeType.startsWith("image")) {
                    resourceType = "image";
                    attachmentType = "image";
                } else if (mimeType != null && mimeType.startsWith("video")) {
                    resourceType = "video";
                    attachmentType = "video";
                } else if (mimeType != null && mimeType.startsWith("application/pdf")) {
                    resourceType = "image";
                    attachmentType = "pdf";
                }

                String originalFilename = file.getOriginalFilename();
                assert originalFilename != null;
                String safeFilename = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");

                Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                        ObjectUtils.asMap(
                                "resource_type", resourceType,
                                "public_id", "uploads/" + safeFilename
                        )
                );

                String fileUrl = (String) uploadResult.get("secure_url");

                // Tạo document mới và gắn với task
                Document document = new Document();
                document.setPathFile(fileUrl);
                document.setTypeFile(attachmentType); // Ensure this field exists in the Document model
                document.setListTaskDocument(Collections.singletonList(task)); // Associate with the task

                Document saved = documentRepository.save(document);
                savedDocuments.add(saved);

            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
            }
        }

        return ResponseEntity.ok(savedDocuments);
    }

    @Transactional
    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<Document>> getDocumentsByTaskId(@PathVariable("taskId") Integer taskId) {
        List<Document> documents = documentRepository.findByListTaskDocument_Id(taskId);
        return ResponseEntity.ok(documents.isEmpty() ? Collections.emptyList() : documents);
    }

    @Transactional
    @PostMapping("/delete")
    public ResponseEntity<String> deleteDocument(
            @RequestParam("documentId") Integer documentId,
            @RequestParam("taskId") Integer taskId) {
        // Kiểm tra task có tồn tại không
        Task task = taskRepository.findById(taskId);
        if (task == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Task không tồn tại");
        }
        // Kiểm tra tài liệu có tồn tại không
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Tài liệu không tồn tại"));
        // Xóa tài liệu khỏi danh sách task
        document.getListTaskDocument().remove(task);
        documentRepository.save(document);
        // Nếu tài liệu không còn thuộc về bất kỳ task nào, xóa tài liệu
        if (document.getListTaskDocument().isEmpty()) {
            // Xóa tài liệu từ Cloudinary
            String publicId = document.getPathFile().substring(document.getPathFile().lastIndexOf("/") + 1);
            CompletableFuture.runAsync(()->{
                try {
                    cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                } catch (IOException e) {
                    e.printStackTrace();
                }
            });
            documentRepository.delete(document);
        }
        return ResponseEntity.ok("Tài liệu đã được xóa thành công");
    }

    @PostMapping("/share")
    public ResponseEntity<String> shareDocument(@RequestParam("documentId") Integer documentId,
                                                @RequestParam("taskId") Integer taskId) {
        // Kiểm tra tài liệu có tồn tại không
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Tài liệu không tồn tại"));

        // Kiểm tra task có tồn tại không
        Task task = taskRepository.findById(taskId);
        if (task == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Công việc không tồn tại");
        }
        // Kiểm tra tài liệu đã được chia sẻ với task chưa
        if (document.getListTaskDocument().contains(task)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tài liệu đã có trong công việc này!");
        }

        // Thêm task vào danh sách task của tài liệu
        if (!document.getListTaskDocument().contains(task)) {
            document.getListTaskDocument().add(task);
            documentRepository.save(document);
        }

        return ResponseEntity.ok("Tài liệu đã được chia sẻ thành công");
    }

}
