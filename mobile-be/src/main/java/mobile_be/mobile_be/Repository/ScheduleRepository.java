package mobile_be.mobile_be.Repository;

import lombok.NonNull;
import mobile_be.mobile_be.Model.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    @Query("""
        SELECT s FROM Schedule s WHERE DATE(s.startTime) = :date ORDER BY
            CASE
            WHEN s.priority = 'HIGH' THEN 2
            WHEN s.priority = 'NORMAL' THEN 1
            WHEN s.priority = 'LOW' THEN 0
        END DESC
    """)
    List<Schedule> findSchedulesByDate(LocalDate date);


    @Query("""
    SELECT DATE(s.startTime),
           MAX(CASE
               WHEN s.priority = 'HIGH' THEN 2
               WHEN s.priority = 'NORMAL' THEN 1
               WHEN s.priority = 'LOW' THEN 0
           END)
    FROM Schedule s
    GROUP BY DATE(s.startTime)
    """)
    List<Object[]> findHighlightedDates();
    Optional<Schedule> findById(Long id);
    void deleteById(@NonNull Long id);
}
