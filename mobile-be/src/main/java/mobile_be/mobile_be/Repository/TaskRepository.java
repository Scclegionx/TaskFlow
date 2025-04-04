package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByToDateBetween(LocalDateTime start, LocalDateTime end);



    @Query(value = "SELECT " +
            "CASE " +
            "    WHEN status = 1 AND CURRENT_DATE > to_date THEN 4 " +
            "    ELSE status " +
            "END AS status, " +
            "COUNT(*) as count " +
            "FROM tasks " +
            "WHERE status IN (1, 2, 3) " +  // Không cần kiểm tra 4 vì nó không tồn tại
            "GROUP BY CASE " +
            "    WHEN status = 1 AND CURRENT_DATE > to_date THEN 4 " +
            "    ELSE status " +
            "END",
            nativeQuery = true)
    List<Object[]> getAllTaskCountByStatus();



    @Query(value = "SELECT status, COUNT(*) as count FROM (" +
            "    SELECT " +
            "        CASE " +
            "            WHEN status = 1 AND CURRENT_DATE > to_date THEN 4 " +
            "            ELSE status " +
            "        END AS status " +
            "    FROM tasks " +
            "    WHERE created_by = :userId AND status IN (1, 2, 3) " +
            ") AS subquery " +
            "GROUP BY status",
            nativeQuery = true)
    List<Object[]> getTaskCountByStatusGiao(Integer userId);


//    @Query(value = "SELECT status, COUNT(*) as count FROM tasks t " +
//            " join task_assignees ta on t.id = ta.task_id " +
//            " WHERE ta.user_id = :userId   " +
//            " and status IN (1, 2, 3, 4) GROUP BY status", nativeQuery = true)
//    List<Object[]> getTaskCountByStatusDuocGiao(Integer userId);

    @Query(value = "SELECT status, COUNT(*) as count FROM (" +
            "    SELECT " +
            "        CASE " +
            "            WHEN t.status = 1 AND CURRENT_DATE > t.to_date THEN 4 " +
            "            ELSE t.status " +
            "        END AS status " +
            "    FROM tasks t " +
            "    JOIN task_assignees ta ON t.id = ta.task_id " +
            "    WHERE ta.user_id = :userId AND t.status IN (1, 2, 3) " +
            ") AS subquery " +
            "GROUP BY status",
            nativeQuery = true)
    List<Object[]> getTaskCountByStatusDuocGiao(Integer userId);


    @Query(value = "SELECT * from tasks where status = :status", nativeQuery = true)
    List<Task> findTasksByStatus(Integer status);


    @Query(value ="SELECT * from tasks  t where t.id = :taskId", nativeQuery = true)
    Task getTaskDetail(Integer taskId);


    @Query(value = "SELECT  * from tasks t where t.id = :taskId", nativeQuery = true)
    Task findById(Integer taskId);

}
