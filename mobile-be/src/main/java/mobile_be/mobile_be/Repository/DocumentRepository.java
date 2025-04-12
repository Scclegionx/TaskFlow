package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Integer> {
    List<Document> findByListTaskDocument_Id(Integer idTask);
}
