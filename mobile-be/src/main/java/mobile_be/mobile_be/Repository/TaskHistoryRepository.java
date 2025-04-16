package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.TaskHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TaskHistoryRepository extends JpaRepository<TaskHistory , Integer> {
    TaskHistory findTopByTaskIdOrderByModifiedAtDesc(Integer taskId);


    @Query(value = "SELECT th.* FROM task_history th " +
            " join tasks t on t.id = th.task_id " +
            " WHERE" +
            " ( :taskHistoryId is null or th.id = :taskHistoryId ) " +
            " and :textSearch is null or t.title LIKE CONCAT('%', :textSearch, '%') " +
            "ORDER BY modified_at DESC", nativeQuery = true)
    List<TaskHistory> getTaskHistory(Integer taskHistoryId , String textSearch);
}
