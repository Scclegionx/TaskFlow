package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    List<User> findByEmailContainingIgnoreCase(String email);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    Optional<User> findByResetPasswordToken(String token);


    @Query(value = "SELECT u.id, u.name, u.email, u.gender, " +
            "u.date_of_birth, k.total_point, k.kpi_registry, " +
            "COALESCE(SUM(t.total_hours), 0)  ,  u.avatar " +
            "FROM users u " +
            "LEFT JOIN kpi k ON k.user_id = u.id " +
            "LEFT JOIN tydstate t ON t.user_id = u.id " +
            "WHERE u.id = :userId " +
            "AND (:startDate IS NULL OR t.checkin >= :startDate) " +
            "AND (:endDate IS NULL OR t.checkin <= :endDate) " +
            "GROUP BY u.id, u.name, u.email, u.gender, u.date_of_birth, k.total_point, k.kpi_registry, u.avatar " +
            "LIMIT 1",
            nativeQuery = true)
    Object[] getUserById(Integer userId, LocalDate startDate, LocalDate endDate);


    @Query(value = "Select u.* from users u " +
            "join project_members pm on pm.user_id = u.id " +
            " group by u.id" , nativeQuery = true)
    List<User> getListUser();
}