package mobile_be.mobile_be.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "kpi")
@NoArgsConstructor
@AllArgsConstructor
public class Kpi {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer userId;

    @Column(name = "kpi_registry")
    private Integer kpiRegistry;

    // diem hien tai
    private Integer totalPoint;

    // diem cong
    private Integer plusPoint;

    // diem tru
    private Integer minusPoint;

    // trang thai
    private Integer status;

    // khong  lưu gio
    private LocalDate time;
}
