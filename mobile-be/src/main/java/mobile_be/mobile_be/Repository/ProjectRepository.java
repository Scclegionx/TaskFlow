package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Integer> {
}
