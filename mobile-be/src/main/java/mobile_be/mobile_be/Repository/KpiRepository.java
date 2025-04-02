package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.Kpi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface KpiRepository extends JpaRepository<Kpi, Integer> {


    @Query(value = "SELECT * FROM kpi WHERE user_id = :userId " +
            " AND DATE_FORMAT(time, '%Y-%m') = :time   ",
            nativeQuery = true)
    List<Kpi> findByUserIdAndTime(Integer userId, String time);


    // k.* la lay tat ca cac truong cua bang kpi
    @Query(value = "SELECT k.* FROM kpi k " +
            " join users u on u.id = k.user_id " +
            " WHERE DATE_FORMAT(time, '%Y-%m') = :time " +
            " AND (:textSearch is null or u.name LIKE %:textSearch% ) " +
            "order by k.total_point desc ",
            nativeQuery = true)
    List<Kpi> getKpiByMonth(String time, String textSearch);

    List<Kpi> findByUserId(Integer userId);
}
