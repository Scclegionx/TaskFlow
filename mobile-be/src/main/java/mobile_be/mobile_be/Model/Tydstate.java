package mobile_be.mobile_be.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.text.DateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "tydstate")
@AllArgsConstructor
@NoArgsConstructor
public class Tydstate {

    // bang cham cong cua nhan vien
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer user_id;

    private LocalDateTime checkin;

    private LocalDateTime checkout;

    private int status;

    private float total_hours;
}
