package mobile_be.mobile_be.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.text.DateFormat;

@Data
@Entity
@Table(name = "tydstate")
@AllArgsConstructor
@NoArgsConstructor
public class Tydstate {

    // bang cham cong cua nhan vien
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long user_id;

    private DateFormat checkin;

    private DateFormat checkout;

    private String status;
}
