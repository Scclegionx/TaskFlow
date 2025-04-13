package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.Department;
import mobile_be.mobile_be.Model.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Integer> {


    @Query(value = "select * from team_member tm where tm.status = 1 and tm.user_id = :userId and tm.team_id = :teamId "
            , nativeQuery = true)
    List<TeamMember> findByUserIdAndTeamId(Integer userId, Integer teamId);
}
