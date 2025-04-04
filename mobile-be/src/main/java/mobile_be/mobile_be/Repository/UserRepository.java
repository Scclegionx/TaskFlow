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


    @Query(value = "SELECT u.id, u.name, u.email, u.gender, " +
            "u.date_of_birth, k.total_point, k.kpi_registry, " +
            "COALESCE(SUM(t.total_hours), 0)  ,  u.avatar " +
            "FROM users u " +
            "JOIN kpi k ON k.user_id = u.id " +
            "JOIN tydstate t ON t.user_id = u.id " +
            "WHERE u.id = :userId " +
            "AND t.checkin BETWEEN :startDate AND :endDate " +
            "GROUP BY u.id, u.name, u.email, u.gender, u.date_of_birth, k.total_point, k.kpi_registry, u.avatar " +
            "LIMIT 1",
            nativeQuery = true)
    Object[] getUserById(Integer userId, LocalDate startDate, LocalDate endDate);


    @Query(value = "Select * from users u ," +
            "join projects p on p.user_id = u.id " , nativeQuery = true)
    List<User> getListUser();
}