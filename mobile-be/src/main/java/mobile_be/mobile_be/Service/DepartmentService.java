package mobile_be.mobile_be.Service;

import lombok.extern.slf4j.Slf4j;
import mobile_be.mobile_be.DTO.request.DepartmentRequestDTO;
import mobile_be.mobile_be.DTO.request.TeamRequestDTO;
import mobile_be.mobile_be.DTO.response.DepartmentResponseDTO;
import mobile_be.mobile_be.DTO.response.TeamResponseDTO;
import mobile_be.mobile_be.Model.Department;
import mobile_be.mobile_be.Model.Team;
import mobile_be.mobile_be.Model.TeamMember;
import mobile_be.mobile_be.Model.User;
import mobile_be.mobile_be.Repository.DepartmentRepository;
import mobile_be.mobile_be.Repository.TeamRepository;
import mobile_be.mobile_be.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeamRepository teamRepository;

    public Department createDepartment(DepartmentRequestDTO departmentRequestDTO) {
       try{
           Department department = new Department();
           department.setName(departmentRequestDTO.getName());
           department.setDescription(departmentRequestDTO.getDescription());

           User leader = userRepository.findById(departmentRequestDTO.getLeaderId()).orElse(null);
           if (leader == null) {
              return null;
           }
           department.setLeader(leader);
           department.setStatus(1); // Set status to active
           departmentRepository.save(department);

           return department;
       }catch (Exception e){
          log.info("Error creating department: " + e.getMessage());
          return null;
       }
    }

    public Department updateDepartment(DepartmentRequestDTO departmentRequestDTO) {
        try{
            Department department = departmentRepository.findById(departmentRequestDTO.getId()).orElse(null);
            if (department == null) {
                return null;
            }
            department.setName(departmentRequestDTO.getName());
            department.setDescription(departmentRequestDTO.getDescription());

            User leader = userRepository.findById(departmentRequestDTO.getLeaderId()).orElse(null);
            if (leader == null) {
                return null;
            }
            department.setLeader(leader);
            departmentRepository.save(department);

            return department;
        }catch (Exception e){
           log.info("Error updating department: " + e.getMessage());
           return null;
        }
    }

    public ResponseEntity<?> deleteDepartment(Integer departmentId) {
        try{
            Department department = departmentRepository.findById(departmentId).orElse(null);
            if (department == null) {
                return ResponseEntity.badRequest().body("Department not found");
            }
            department.setStatus(0); // Set status to inactive
            departmentRepository.save(department);
            return ResponseEntity.ok("Department deleted successfully");
        }catch (Exception e){
           log.info("Error deleting department: " + e.getMessage());
           return ResponseEntity.badRequest().body("Error deleting department: " + e.getMessage());
        }
    }

    public List<Department> getAllDepartment(Integer departmentId) {
        try{
            List<Department> listDepartment = departmentRepository.findAll();
            if (listDepartment == null) {
                return null;
            }
            return listDepartment;
        }catch (Exception e){
           log.info("Error getting department: " + e.getMessage());
           return null;
        }
    }

    public DepartmentResponseDTO getDetailDepartment(Integer departmentId) {
        try{
            Department department = departmentRepository.findById(departmentId).orElse(null);
            if (department == null) {
                return null;
            }
            List<Team> listTeam = teamRepository.getAllTeamByDepartmentId(departmentId);
            DepartmentResponseDTO departamentResponseDTO = new DepartmentResponseDTO();
            departamentResponseDTO.setId(department.getId());
            departamentResponseDTO.setName(department.getName());
            departamentResponseDTO.setDescription(department.getDescription());
            departamentResponseDTO.setLeaderId(department.getLeader().getId());
            departamentResponseDTO.setLeaderName(department.getLeader().getName());
            departamentResponseDTO.setStatus(department.getStatus());
            departamentResponseDTO.setListTeam(listTeam);

            return departamentResponseDTO;
        }catch (Exception e){
           log.info("Error getting detail department: " + e.getMessage());
           return null;
        }
    }

    public Team createTeam(TeamRequestDTO teamRequestDTO) {
        try{
            Department department = departmentRepository.findById(teamRequestDTO.getDepartmentId()).orElse(null);
            if (department == null) {
                return null;
            }
            Team team = new Team();
            team.setName(teamRequestDTO.getName());
            team.setDepartment(department);
            team.setStatus(1); // Set status to active
            team.setDescription(teamRequestDTO.getDescription());
            department.getTeams().add(team);
            departmentRepository.save(department);
            return team;
        }catch (Exception e){
           log.info("Error creating team: " + e.getMessage());
           return null;
        }
    }
    public ResponseEntity<?> updateTeam(TeamRequestDTO teamRequestDTO) {
        try{
            Team team =  teamRepository.findById(teamRequestDTO.getId()).orElse(null);
            if (team == null) {
                return ResponseEntity.badRequest().body("Team not found");
            }
            Department department = departmentRepository.findById(teamRequestDTO.getDepartmentId()).orElse(null);
            if (department == null) {
                return ResponseEntity.badRequest().body("Department not found");
            }
            team.setDepartment(department);
            team.setName(teamRequestDTO.getName());
            team.setDescription(teamRequestDTO.getDescription());

            teamRepository.save(team);
            return ResponseEntity.ok("Team updated successfully");
        }catch (Exception e){
           log.info("Error updating team: " + e.getMessage());
           return ResponseEntity.badRequest().body("Error updating team: " + e.getMessage());
        }
    }
    public ResponseEntity<?> deleteTeam(Integer teamId) {
        try{
            Team team = teamRepository.findById(teamId).orElse(null);
            if (team == null) {
                return ResponseEntity.badRequest().body("Team not found");
            }
            team.setStatus(0); // Set status to inactive
            teamRepository.save(team);
            return ResponseEntity.ok("Team deleted successfully");
        }catch (Exception e){
           log.info("Error deleting team: " + e.getMessage());
           return ResponseEntity.badRequest().body("Error deleting team: " + e.getMessage());
        }
    }

    public TeamResponseDTO getDetailTeam(Integer teamId) {
        try{
            Team team = teamRepository.findById(teamId).orElse(null);

            if (team == null) {
                return null;
            }
            User leader = team.getMembers().stream()
                    .filter(member -> member.getRole() == 1) // Filter for leader
                    .map(TeamMember::getUser)
                    .findFirst()
                    .orElse(null);

            log.info("Leader: " + leader);

            List<User> listUser = team.getMembers().stream()
                    .map(TeamMember::getUser)
                    .toList();

            TeamResponseDTO teamResponseDTO = new TeamResponseDTO();
            teamResponseDTO.setId(team.getId());
            teamResponseDTO.setName(team.getName());
            teamResponseDTO.setDescription(team.getDescription());
            teamResponseDTO.setDepartmentId(team.getDepartment().getId());
            teamResponseDTO.setDepartmentName(team.getDepartment().getName());
            teamResponseDTO.setStatus(team.getStatus());
            teamResponseDTO.setLeaderId(leader != null ? leader.getId() : null);
            teamResponseDTO.setLeaderName(leader != null ? leader.getName() : null);
            teamResponseDTO.setMembers(listUser);
            return teamResponseDTO;
        }catch (Exception e){
           log.info("Error getting team: " + e.getMessage());
           return null;
        }
    }

    public ResponseEntity<?> addUserToTeam(Integer userId, Integer teamId) {
        try{
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body("User not found");
            }
            Team team = teamRepository.findById(teamId).orElse(null);
            if (team == null) {
                return ResponseEntity.badRequest().body("Team not found");
            }
            TeamMember teamMember = new TeamMember();
            teamMember.setUser(user);
            teamMember.setTeam(team);
            teamMember.setRole(0); // Set role to member
            team.getMembers().add(teamMember);
            teamRepository.save(team);

            return ResponseEntity.ok("User added to team successfully");
        }catch (Exception e){
           log.info("Error adding user to team: " + e.getMessage());
           return ResponseEntity.badRequest().body("Error adding user to team: " + e.getMessage());
        }
    }
}
