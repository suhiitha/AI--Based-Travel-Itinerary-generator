package Travel_planApi.PlanApi.Repository;

import Travel_planApi.PlanApi.Entity.Events;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventsRepository extends JpaRepository<Events, Long> {
    List<Events> findByDistrictIgnoreCase(String district);
}
