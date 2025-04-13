package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, Integer> {

    @Query(value = "select  * from  department d where d.status = 1 and " +
            " :textSearch is null or d.name like concat('%', :textSearch, '%') " +
            " order by d.created_at desc "
            , nativeQuery = true)
    List<Department> getAllDepartment(String textSearch);
}
