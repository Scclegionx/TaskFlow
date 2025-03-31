package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.Tydstate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TydstateRepository extends JpaRepository<Tydstate, Integer> {


    @Query(value = "SELECT * FROM tydstate WHERE user_id = :userId AND DATE(checkin) = :checkin ",
            nativeQuery = true)
    Tydstate findByUser_idAndCheckinContaining(Integer userId, String checkin);
}
