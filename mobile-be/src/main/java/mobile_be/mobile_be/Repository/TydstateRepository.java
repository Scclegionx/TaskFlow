package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.Tydstate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Date;
import java.util.List;

public interface TydstateRepository extends JpaRepository<Tydstate, Integer> {


    @Query(value = "SELECT * FROM tydstate WHERE user_id = :userId AND DATE(checkin) = :checkin ",
            nativeQuery = true)
    Tydstate findByUser_idAndCheckinContaining(Integer userId, String checkin);


    // cho lay tu 00 ngay dau den 23:59 ngay cuoi
    @Query(value = "SELECT t.* FROM tydstate t " +
            " join users u on u.id = t.user_id " +
            " WHERE (:startDate IS NULL OR t.checkin >= :startDate) " +
            " AND (:endDate IS NULL OR t.checkin <= :endDate + INTERVAL 1 DAY - INTERVAL 1 MICROSECOND)  " +
            " AND (:textSearch is null or u.name LIKE CONCAT('%', :textSearch, '%') ) " +
            " order by t.checkin desc " ,
            nativeQuery = true)
    List<Tydstate> getAllTydstate(String startDate, String endDate, String textSearch);

}
