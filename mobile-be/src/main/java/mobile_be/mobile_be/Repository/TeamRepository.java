package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TeamRepository extends JpaRepository<Team, Integer> {

    @Query(value =  "SELECT * FROM team t WHERE t.department_id = :departmentId and t.status = 1 "
            ,nativeQuery = true)
    List<Team> getAllTeamByDepartmentId(Integer departmentId);

}
