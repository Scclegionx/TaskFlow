package mobile_be.mobile_be.Controller;

import mobile_be.mobile_be.Model.Kpi;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.KpiRepository;
import mobile_be.mobile_be.Repository.UserRepository;
import mobile_be.mobile_be.Service.DepartmentService;
import mobile_be.mobile_be.Service.ExcelGenerator;
import mobile_be.mobile_be.Service.UserService;
import mobile_be.mobile_be.contains.enum_tydstate;
import org.apache.poi.util.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;

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


}
