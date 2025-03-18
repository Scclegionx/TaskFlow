package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Integer> {


    @Query(value = "SELECT " +
            "(SELECT COUNT(*) FROM projects) AS total1, " +
            "(SELECT COUNT(*) FROM tasks) AS total2, " +
            "(SELECT COUNT(*) FROM users) AS total3",
            nativeQuery = true)
    List<Object[]> getNumberProjectAndTask();


}
