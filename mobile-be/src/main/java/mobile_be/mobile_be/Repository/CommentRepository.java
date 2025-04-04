package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Integer> {


    @Query(value = "SELECT * FROM comment c WHERE " +
            ":taskId is null or c.task_id = :taskId " +
            " order by c.date desc "
            , nativeQuery = true)
    List<Comment> findByTaskId(Integer taskId);
}
