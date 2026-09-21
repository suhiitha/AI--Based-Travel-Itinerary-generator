package Travel_planApi.PlanApi.Repository;

// TODO: UNUSED — No controller currently calls methods on this repository.
// Keeping for potential future mood-based personalization features.
import Travel_planApi.PlanApi.Entity.UserMood;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserMoodRepository extends JpaRepository<UserMood, Long> {
    List<UserMood> findByMood(String mood);
}
