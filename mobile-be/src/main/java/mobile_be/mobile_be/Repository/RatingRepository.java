package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RatingRepository extends JpaRepository<Rating, Integer> {

    @Query(value = "SELECT * FROM rating WHERE user_id = :userId",
            nativeQuery = true)
    List<Rating> getRatingUser(Integer userId);
}
