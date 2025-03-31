package mobile_be.mobile_be.Controller;

import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.UserRepository;
import mobile_be.mobile_be.Service.ExcelGenerator;
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

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;

@Controller
@RequestMapping("/api/document")
public class DocumentController {

    @Autowired
    private UserRepository userRepository;



    @GetMapping("/download")
    public ResponseEntity<Resource> downloadExcel() throws IOException {
        String[] headers = {"ID", "Tên", "Email"};

        List<User> users = userRepository.findAll();
        List<String[]> data = Arrays.asList(
                users.stream().map(user -> new String[]{
                        String.valueOf(user.getId()),
                        user.getName(),
                        user.getEmail()
                }).toArray(String[][]::new)
        );

        byte[] excelBytes = ExcelGenerator.generateExcel(data, headers);

        ByteArrayResource resource = new ByteArrayResource(excelBytes);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=data.xlsx")
                .body(resource);
    }

}
