package mobile_be.mobile_be.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Entity
@Table(name = "documents")
@AllArgsConstructor
@NoArgsConstructor
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String pathFile;
    private String typeFile;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "task_document",
            joinColumns = @JoinColumn(name = "document_id"),
            inverseJoinColumns = @JoinColumn(name = "task_id")
    )
    private List<Task> listTaskDocument; // Danh sách tai lieu cua task

}
