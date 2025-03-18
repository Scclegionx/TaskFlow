package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByDeadlineBetween(LocalDateTime start, LocalDateTime end);


    @Query(value = "SELECT status, COUNT(*) as count FROM tasks WHERE status IN (1, 2, 3, 4) GROUP BY status", nativeQuery = true)
    List<Object[]> getTaskCountByStatus();
}
