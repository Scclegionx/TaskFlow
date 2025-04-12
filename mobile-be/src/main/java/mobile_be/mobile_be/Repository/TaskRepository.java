package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByToDateBetween(LocalDateTime start, LocalDateTime end);


    @Query(value = "SELECT * FROM tasks t WHERE t.status = 1 AND t.to_date < CURRENT_DATE"
            , nativeQuery = true)
    List<Task> getOverDueTask();


    @Query(value = """
            SELECT 
                status, COUNT(*) as count 
            FROM tasks 
            WHERE status IN (0, 1, 2, 3, 4) 
            GROUP BY status
            """, nativeQuery = true)
    List<Object[]> getAllTaskCountByStatus();


    @Query(value = """
            SELECT status, COUNT(*) as count 
            FROM tasks 
            WHERE created_by = :userId 
              AND status IN (0, 1, 2, 3, 4)
            GROUP BY status
            """, nativeQuery = true)
    List<Object[]> getTaskCountByStatusGiao(@Param("userId") Integer userId);


//    @Query(value = "SELECT status, COUNT(*) as count FROM tasks t " +
//            " join task_assignees ta on t.id = ta.task_id " +
//            " WHERE ta.user_id = :userId   " +
//            " and status IN (1, 2, 3, 4) GROUP BY status", nativeQuery = true)
//    List<Object[]> getTaskCountByStatusDuocGiao(Integer userId);

    @Query(value = """
            SELECT t.status, COUNT(*) as count 
            FROM tasks t
            JOIN task_assignees ta ON t.id = ta.task_id
            WHERE ta.user_id = :userId 
              AND t.status IN (0, 1, 2, 3, 4)
            GROUP BY t.status
            """, nativeQuery = true)
    List<Object[]> getTaskCountByStatusDuocGiao(@Param("userId") Integer userId);



    @Query(value = "SELECT * from tasks where status = :status", nativeQuery = true)
    List<Task> findTasksByStatus(Integer status);


    @Query(value ="SELECT * from tasks  t where t.id = :taskId", nativeQuery = true)
    Task getTaskDetail(Integer taskId);


    @Query(value = "SELECT  * from tasks t where t.id = :taskId", nativeQuery = true)
    Task findById(Integer taskId);

    List<Task> findByProjectIdAndParentIdIsNull(Integer projectId);

    List<Task> findByParentId(Integer parentId);
}
