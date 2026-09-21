package Travel_planApi.PlanApi.Repository;

import Travel_planApi.PlanApi.Entity.TripPlace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TripPlaceRepository extends JpaRepository<TripPlace, Long> {
}
