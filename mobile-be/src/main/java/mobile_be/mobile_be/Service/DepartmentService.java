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
import mobile_be.mobile_be.Repository.TeamMemberRepository;
import mobile_be.mobile_be.Repository.TeamRepository;
import mobile_be.mobile_be.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Slf4j
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    TeamMemberRepository teamMemberRepository;

    public Department createDepartment(DepartmentRequestDTO departmentRequestDTO) {
       try{
           log.info("Creating department: " + departmentRequestDTO.toString());
           Department department = new Department();
           department.setName(departmentRequestDTO.getName());
           department.setDescription(departmentRequestDTO.getDescription());

           LocalDateTime createdAt = LocalDateTime.now();

           User leader = userRepository.findById(departmentRequestDTO.getLeaderId()).orElse(null);
           if (leader == null) {
              return null;
           }
           department.setLeader(leader);
           department.setCreatedAt(createdAt);
           department.setStatus(1); // Set status to active
           departmentRepository.save(department);

           return department;
       }catch (Exception e){
          log.info("Error creating department: " + e.getMessage());
           throw e;
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
            throw e;
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

    public List<Department> getAllDepartment(Integer departmentId, String textSearch) {
        try{
            List<Department> listDepartment = departmentRepository.getAllDepartment(textSearch);
            if (listDepartment == null) {
                return null;
            }
            return listDepartment;
        }catch (Exception e){
           log.info("Error getting department: " + e.getMessage());
            throw e;
        }
    }

    public DepartmentResponseDTO getDetailDepartment(Integer departmentId) {
        try{
            Department department = departmentRepository.findById(departmentId).orElse(null);
            if (department == null) {
                return null;
            }
            List<Team> listTeam = teamRepository.getAllTeamByDepartmentId(departmentId);
            listTeam.forEach(team -> {
                Set<Integer> seenUserIds = new HashSet<>();
                List<TeamMember> filteredMembers = team.getMembers().stream()
                        .filter(member -> seenUserIds.add(member.getUser().getId())) // add() trả false nếu ID đã tồn tại
                        .toList();
                team.setMembers(filteredMembers);
            });
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
            throw e;
        }
    }

    public User getTeamLeader(Integer teamId) {
        try{
            Team team = teamRepository.findById(teamId).orElse(null);
            if (team == null) {
                return null;
            }
            User leader = team.getMembers().stream()
                    .filter(member -> member.getRole() == 1 && member.getStatus() == 1 ) // Filter for leader
                    .map(TeamMember::getUser)
                    .findFirst()
                    .orElse(null);
            return leader;
        }catch (Exception e){
           log.info("Error getting team leader: " + e.getMessage());
            throw e;
        }
    }

    @Transactional
    public Team createTeam(TeamRequestDTO teamRequestDTO) {
        try{
            Department department = departmentRepository.findById(teamRequestDTO.getDepartmentId()).orElse(null);
            if (department == null) {
                throw new RuntimeException("Department not found");
            }
            User user = userRepository.findById(teamRequestDTO.getTeamLeaderId()).orElse(null);
            log.info("User: " + user.getId());
            if (user == null) {
               throw new RuntimeException("User not found");
            }
            LocalDateTime createdAt = LocalDateTime.now();

            TeamMember teamMember = new TeamMember();
            teamMember.setUser(user);
            teamMember.setRole(1); // Set role to leader
            teamMember.setCreatedAt(createdAt);
            teamMember.setStatus(1); // Set status to active

            Team team = new Team();
            team.setName(teamRequestDTO.getName());
            team.setDepartment(department);
            team.setCreatedAt(createdAt);
            team.setStatus(1); // Set status to active
            team.setDescription(teamRequestDTO.getDescription());
            team.setMembers(List.of(teamMember));

            teamRepository.save(team);
            teamMember.setTeam(team);
            teamMemberRepository.save(teamMember);
            return team;
        }catch (Exception e){
           log.info("Error creating team: " + e.getMessage());
            throw e;
        }
    }
    public ResponseEntity<?> updateTeam(TeamRequestDTO teamRequestDTO) {
        try{
            log.info(" bat dau cap nhap team : leader : " + teamRequestDTO.getTeamLeaderId());
            Team team =  teamRepository.findById(teamRequestDTO.getId()).orElse(null);
            if (team == null) {
                return ResponseEntity.badRequest().body("Team not found");
            }
            Department department = departmentRepository.findById(teamRequestDTO.getDepartmentId()).orElse(null);
            if (department == null) {
                return ResponseEntity.badRequest().body("Department not found");
            }
            User newLeader = userRepository.findById(teamRequestDTO.getTeamLeaderId()).orElse(null);
            if (newLeader == null) {
                return ResponseEntity.badRequest().body("Leader not found");
            }

            TeamMember oldLeader = team.getMembers().stream()
                    .filter(member -> member.getRole() == 1 && member.getStatus() == 1) // Filter for leader
                    .findFirst()
                    .orElse(null);
            oldLeader.setRole(0); // Set old leader to member
            oldLeader.setStatus(1); // Set status to active
            teamMemberRepository.save(oldLeader);

            // tim xem cai leaderId moi truyen vao da ton tai hay chua
            TeamMember checkMemberExist = team.getMembers().stream()
                    .filter(member -> member.getId() == teamRequestDTO.getTeamLeaderId() ) // Filter for leader
                    .findFirst()
                    .orElse(null);
            if (checkMemberExist == null) {
                TeamMember newTeamMember = new TeamMember();
                newTeamMember.setUser(newLeader);
                newTeamMember.setRole(1); // Set role to leader
                newTeamMember.setCreatedAt(LocalDateTime.now());
                newTeamMember.setStatus(1); // Set status to active
                newTeamMember.setTeam(team);
                teamMemberRepository.save(newTeamMember);
            } else {
                checkMemberExist.setRole(1); // Set role to leader
                checkMemberExist.setStatus(1); // Set status to active
                teamMemberRepository.save(checkMemberExist);
            }


            team.setDepartment(department);
            team.setName(teamRequestDTO.getName());
            team.setDescription(teamRequestDTO.getDescription());

            teamRepository.save(team);
            return ResponseEntity.ok("Team updated successfully");
        }catch (Exception e){
           log.info("Error updating team: " + e.getMessage());
           throw e;
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
                    .filter(member -> member.getRole() == 1 && member.getStatus() == 1 ) // Filter for leader
                    .map(TeamMember::getUser)
                    .findFirst()
                    .orElse(null);

            log.info("Leader: " + leader);

            List<User> listUser = team.getMembers().stream()
                    .filter(member -> member.getStatus() == 1)
                    .map(TeamMember::getUser)
                    .distinct()
                    .sorted(Comparator.comparing(User::getName))
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
            throw e;
        }
    }

    public TeamMember addUserToTeam(Integer userId, Integer teamId) {
        try{
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                throw new Exception("User not found");
            }
            List<TeamMember> existingMembers = teamMemberRepository.findByUserIdAndTeamId(userId, teamId);
            if (!existingMembers.isEmpty()) {
                throw new Exception("User already exists in the team");
            }
            Team team = teamRepository.findById(teamId).orElse(null);
            if (team == null) {
               throw new Exception("Team not found");
            }
            TeamMember teamMember = new TeamMember();
            teamMember.setUser(user);
            teamMember.setTeam(team);
            teamMember.setStatus(1); // Set status to active
            teamMember.setCreatedAt(LocalDateTime.now());
            teamMember.setRole(0); // Set role to member
            team.getMembers().add(teamMember);
            teamRepository.save(team);

            return teamMember;
        }catch (Exception e){
           log.info("Error adding user to team: " + e.getMessage());
            throw new RuntimeException("Error adding user to team: " + e.getMessage());
        }
    }

    public ResponseEntity<?> removeUserFromTeam(Integer userId, Integer teamId) {
        try{
            Team team = teamRepository.findById(teamId).orElse(null);
            if (team == null) {
                return ResponseEntity.badRequest().body("Team not found");
            }
            List<TeamMember> existingMembers = teamMemberRepository.findByUserIdAndTeamId(userId, teamId);
            if (existingMembers.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found in the team");
            }
            TeamMember teamMember = existingMembers.get(0);
           teamMember.setStatus(0); // Set status to inactive
            teamMemberRepository.save(teamMember);
            return ResponseEntity.ok("User removed from team successfully");
        }catch (Exception e){
           log.info("Error removing user from team: " + e.getMessage());
           return ResponseEntity.badRequest().body("Error removing user from team: " + e.getMessage());
        }
    }
}
