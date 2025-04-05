package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.ProjectMember;
import mobile_be.mobile_be.Model.ProjectMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, ProjectMemberId> {
}
