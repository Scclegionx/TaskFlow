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
            "(SELECT COUNT(*) FROM projects p WHERE status = 2 " +
            " AND (p.id = :projectId OR :projectId IS NULL)) AS total1, " +  // hoan thanh

            "(SELECT COUNT(*) FROM projects p WHERE status = 1 " +
            " AND (p.id = :projectId OR :projectId IS NULL) " +
            " AND (CURRENT_DATE <= p.to_date OR p.to_date IS NULL)) AS total2, " +  // dang xu ly

            "(SELECT COUNT(*) FROM projects p WHERE status = 1 " +
            " AND (p.id = :projectId OR :projectId IS NULL) " +
            " AND (CURRENT_DATE > p.to_date)) AS total3",   // qua  han
            nativeQuery = true)
    List<Object[]> getNumberProjectByStatus(Integer projectId);


    @Query(value = "SELECT " +
            "(SELECT COUNT(*) FROM projects p WHERE status = 2 " +
            " AND p.created_by = :userId " +
            " AND (p.id = :projectId OR :projectId IS NULL)) AS total1, " + // hoan thanh

            "(SELECT COUNT(*) FROM projects p WHERE status = 1 " +
            " AND p.created_by = :userId " +
            " AND (p.id = :projectId OR :projectId IS NULL) " +
            " AND (CURRENT_DATE <= p.to_date OR p.to_date IS NULL)) AS total2, " +   // dang xu ly

            "(SELECT COUNT(*) FROM projects p WHERE status = 1 " +
            " AND p.created_by = :userId " +
            " AND (p.id = :projectId OR :projectId IS NULL) " +
            " AND (CURRENT_DATE > p.to_date)) AS total3",    // qua han
            nativeQuery = true)
    List<Object[]> getNumberProjectByStatusGiao(Integer projectId, Integer userId);


//    @Query(value = "SELECT " +
//            "(SELECT COUNT(*) FROM projects p " +
//            " join project_members pm on p.id = pm.project_id " +
//            " WHERE status = 2 and " +
//            " pm.user_id = :userId and " +
//            "( p.id = :projectId  or :projectId is null)) AS total1, " +
//            "(SELECT COUNT(*) FROM projects p " +
//            " join project_members pm on p.id = pm.project_id " +
//            " WHERE status = 1 and " +
//            " pm.user_id = :userId and " +
//            "( p.id = :projectId  or :projectId is null)) AS total2, " +
//            "(SELECT COUNT(*) FROM projects p " +
//            " join project_members pm on p.id = pm.project_id " +
//            " WHERE status = 4 and " +
//            " pm.user_id = :userId and " +
//            "( p.id = :projectId  or :projectId is null)) AS total3 " ,
//            nativeQuery = true)
//    List<Object[]> getNumberProjectByStatusDuocGiao(Integer projectId, Integer userId);

    @Query(value = "SELECT " +
            "COUNT(CASE WHEN p.status = 2 THEN 1 END) AS total1, " +
            "COUNT(CASE WHEN p.status = 1 AND (CURRENT_DATE <= p.to_date OR p.to_date IS NULL) THEN 1 END) AS total2, " +
            "COUNT(CASE WHEN p.status = 1 AND CURRENT_DATE > p.to_date THEN 1 END) AS total3 " +
            "FROM projects p " +
            "JOIN project_members pm ON p.id = pm.project_id " +
            "WHERE pm.user_id = :userId " +
            "AND (:projectId IS NULL OR p.id = :projectId)",
            nativeQuery = true)
    List<Object[]> getNumberProjectByStatusDuocGiao(Integer projectId, Integer userId);




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



// sử dung "in" truy van thi chi lay cac phan tu khac nhau

    @Query(value = "SELECT * FROM users u WHERE u.id IN " +
            "(SELECT user_id FROM project_members WHERE" +
            " :projectId is null or project_id = :projectId)", nativeQuery = true)
    List<User> getAllMemberInProject(Integer projectId);

}
