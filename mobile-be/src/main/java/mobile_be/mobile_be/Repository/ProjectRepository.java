package mobile_be.mobile_be.Repository;

import jakarta.persistence.criteria.CriteriaBuilder;
import mobile_be.mobile_be.Model.Project;
import mobile_be.mobile_be.Model.Task;
import mobile_be.mobile_be.Model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
            "(SELECT COUNT(DISTINCT u.id) FROM users u " +
            "join project_members pm on u.id = pm.user_id " +
            " ) AS total3",
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

            "(SELECT COUNT(*) FROM projects p WHERE status = 4 " +
            " AND (p.id = :projectId OR :projectId IS NULL) ) AS total3 ," +
             // qua  han

            "(SELECT COUNT(*) FROM projects p WHERE status = 0 " +
            " AND (p.id = :projectId OR :projectId IS NULL)) AS total4 " ,
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

            "(SELECT COUNT(*) FROM projects p WHERE status = 4 " +
            " AND p.created_by = :userId " +
            " AND (p.id = :projectId OR :projectId IS NULL) )  AS total3 , " +
            // qua han

            "(SELECT COUNT(*) FROM projects p WHERE status = 0 " +
            " AND (p.id = :projectId OR :projectId IS NULL)) AS total4 " ,
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
            "COUNT(CASE WHEN p.status = 4 THEN 1 END) AS total3 , " +
            "COUNT(CASE WHEN p.status = 0  THEN 1 END) AS total4 " +
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



    @Query(value = "SELECT * FROM tasks t WHERE " +
            "( :projectId  is null or project_id = :projectId )" +
            " AND (:textSearch IS NULL OR LOWER(title) LIKE LOWER(CONCAT('%', :textSearch, '%'))) " +
            " order by t.created_at desc ",
            nativeQuery = true)
    List<Task> getAllTaskInProject(Integer projectId, String textSearch);


    @Query(value = "SELECT * FROM tasks t WHERE " +
            "(:projectId  is null or t.project_id = :projectId)  and  " +
            " t.created_by = :userId " +
            "AND (:textSearch IS NULL OR LOWER(title) LIKE LOWER(CONCAT('%', :textSearch, '%'))) " +
            " order by t.created_at desc ",
            nativeQuery = true)
    List<Task> getAllTaskInProjectGiao(Integer projectId, Integer userId, String textSearch);

    @Query(value = "SELECT * FROM tasks t " +
            " left join task_assignees ta on ta.task_id = t.id" +
            " WHERE " +
            " ( (ta.user_id = :userId and t.status = 0) or ( t.created_by = :userId and t.wait_finish = 1) ) and " +
            "( :projectId  is null or project_id = :projectId )" +
            " AND (:textSearch IS NULL OR LOWER(title) LIKE LOWER(CONCAT('%', :textSearch, '%')))" +
            " ORDER BY t.created_at desc ",
            nativeQuery = true)
    List<Task> getAllTaskPending(Integer projectId, Integer userId,  String textSearch);


    @Query(value = "SELECT DISTINCT t.* FROM tasks t " +
            " left join task_assignees ta on ta.task_id = t.id" +
            " WHERE " +
            " ta.user_id = :userId and " +
            " t.status != 0 and " +
            "( :projectId  is null or project_id = :projectId )" +
            " AND (:textSearch IS NULL OR LOWER(title) LIKE LOWER(CONCAT('%', :textSearch, '%')))" +
            " ORDER BY t.created_at desc ",
            nativeQuery = true)
    List<Task> getMyTask(Integer projectId, Integer userId,  String textSearch);


    @Query(value = "SELECT * FROM tasks t" +
            " join task_assignees ta on ta.task_id = t.id " +
            " WHERE ta.user_id = :userId and  " +
            "(:projectId  is null or t.project_id = :projectId)  and  " +
            " t.created_by = :userId " +
            "AND (:textSearch IS NULL OR LOWER(title) LIKE LOWER(CONCAT('%', :textSearch, '%')))  " +
            " and ( t.status = 0 ) " +
            " order by t.created_at desc ",
            nativeQuery = true)
    List<Task> getAllTaskPendingNhan(Integer projectId, Integer userId, String textSearch);

    @Query(value = "SELECT * FROM tasks t" +
            " WHERE t.created_by = :userId and " +
            "(:projectId  is null or t.project_id = :projectId)  and  " +
            " t.created_by = :userId " +
            "AND (:textSearch IS NULL OR LOWER(title) LIKE LOWER(CONCAT('%', :textSearch, '%')))  " +
            " and ( t.status = 1  ) " +
            "and t.wait_finish = 1 " +
            " order by t.created_at desc ",
            nativeQuery = true)
    List<Task> getAllTaskPendingDuyetHoanThanh(Integer projectId, Integer userId, String textSearch);



    @Query(value = "SELECT * FROM tasks t " +
            " join task_assignees  ta on ta.task_id = t.id  " +
            " WHERE ta.user_id = :userId and  " +
            "( :projectId  is null or t.project_id = :projectId )" +
            "AND (:textSearch IS NULL OR LOWER(title) LIKE LOWER(CONCAT('%', :textSearch, '%'))) " +
            " order by t.created_at desc ",
            nativeQuery = true)
    List<Task> getAllTaskInProjectDuocGiao(Integer projectId, Integer userId, String textSearch);



// sử dung "in" truy van thi chi lay cac phan tu khac nhau

    @Query(value = "SELECT * FROM users u WHERE u.id IN " +
            "(SELECT user_id FROM project_members WHERE" +
            " :projectId is null or project_id = :projectId) " +
            "AND (:textSearch IS NULL OR LOWER(name) LIKE LOWER(CONCAT('%', :textSearch, '%')))",
            nativeQuery = true)
    List<User> getAllMemberInProject(Integer projectId, String textSearch);

    @Query("SELECT DISTINCT p FROM Project p JOIN p.projectMembers pm WHERE pm.user.id = ?1")
    Page<Project> findByProjectMembersUserId(Integer userId, Pageable pageable);

    @Query(value = "SELECT COUNT(*) FROM project_members WHERE project_id = :projectId", nativeQuery = true)
    Integer countMembersByProjectId(Integer projectId);

    @Query("SELECT p FROM Project p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', ?1, '%'))")
    List<Project> searchProjects(String query);

    @Query(value = "SELECT u.* FROM users u " +
            "JOIN project_members pm ON u.id = pm.user_id " +
            "WHERE pm.project_id = :projectId " +
            "AND (:searchText IS NULL OR LOWER(u.name) LIKE LOWER(CONCAT('%', :searchText, '%')) " +
            "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :searchText, '%'))) " +
            "ORDER BY u.name ASC", nativeQuery = true)
    List<User> searchMembersInProject(Integer projectId, String searchText);

    @Query(value = "SELECT t.* FROM tasks t " +
            "WHERE t.project_id = :projectId " +
            "AND (:searchText IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :searchText, '%')) " +
            "OR LOWER(t.description) LIKE LOWER(CONCAT('%', :searchText, '%'))) " +
            "ORDER BY t.created_at DESC", nativeQuery = true)
    List<Task> searchTasksInProject(Integer projectId, String searchText);

}
