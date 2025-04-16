package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.ScheduleParticipants;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ScheduleParticipantsRepository extends JpaRepository<ScheduleParticipants, Long> {
    void deleteByScheduleIdAndUserId(Long scheduleId, Integer userId);
} 