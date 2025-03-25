package mobile_be.mobile_be.Repository;

import jakarta.persistence.criteria.CriteriaBuilder;
import mobile_be.mobile_be.Model.Project;
import mobile_be.mobile_be.Model.Task;
import mobile_be.mobile_be.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;
import java.util.Optional;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Integer> {

        @EntityGraph(attributePaths = {"projectMembers.user"}) 
        Optional<Project> findById(Integer id);


    @Query(value = "SELECT " +
            "(SELECT COUNT(*) FROM projects) AS total1, " +
            "(SELECT COUNT(*) FROM tasks) AS total2, " +
            "(SELECT COUNT(*) FROM users) AS total3",
            nativeQuery = true)
    List<Object[]> getNumberProjectAndTask();

//
//    PENDING(0),        //  đang chờ xử lý
//    IN_PROGRESS(1),    //  đang được thực hiện
//    COMPLETED(2),      //  đã hoàn thành
//    CANCELLED(3),      // đã bị hủy
//    OVERDUE(4);        // quá hạn


    @Query(value = "SELECT " +
            "(SELECT COUNT(*) FROM projects p WHERE status = 2 and" +
            "( p.id = :projectId  or :projectId is null)) AS total1, " +
            "(SELECT COUNT(*) FROM projects p WHERE status = 1 and" +
            "( p.id = :projectId  or :projectId is null)) AS total2, " +
            "(SELECT COUNT(*) FROM projects p WHERE status = 4 and" +
            "( p.id = :projectId  or :projectId is null)) AS total3 " ,
            nativeQuery = true)
    List<Object[]> getNumberProjectByStatus(Integer projectId);


    @Query(value = "SELECT COUNT(*) FROM tasks WHERE project_id = :projectId", nativeQuery = true)
    Integer findAllTaskInProject(int projectId);


    @Query(value = "SELECT COUNT(*) FROM tasks WHERE project_id = :projectId AND status = 2", nativeQuery = true)
    Integer totalTaskFinishInProject(int projectId);


    @Query(value = "SELECT * FROM projects WHERE " +
            ":name IS NULL OR name LIKE CONCAT('%', :name, '%')" +
            "And (:projectId IS NULL OR id = :projectId)"
            , nativeQuery = true)
    List<Project>  getAllProject(String name, Integer projectId);


    @Query(value = "SELECT * FROM tasks WHERE " +
            ":projectId  is null or project_id = :projectId", nativeQuery = true)
    List<Task> getAllTaskInProject(Integer projectId);



    @Query(value = "SELECT * FROM users u WHERE u.id IN " +
            "(SELECT user_id FROM project_members WHERE" +
            " :projectId is null or project_id = :projectId)", nativeQuery = true)
    List<User> getAllMemberInProject(Integer projectId);

}
