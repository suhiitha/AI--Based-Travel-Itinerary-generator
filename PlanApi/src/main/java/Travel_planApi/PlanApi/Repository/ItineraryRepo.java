package Travel_planApi.PlanApi.Repository;

import Travel_planApi.PlanApi.Entity.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ItineraryRepo extends JpaRepository<Itinerary, Long> {

    @Query("SELECT DISTINCT i.district FROM Itinerary i")
    List<String> findAllDistinctDistricts();

    List<Itinerary> findByCategoryIn(List<String> categories);

    @Query("SELECT i FROM Itinerary i WHERE i.district = :district AND i.category = :category")
    List<Itinerary> findByDistrictAndCategory(@Param("district") String district, @Param("category") String category);

    List<Itinerary> findByDistrict(String district);

    List<Itinerary> findByCategory(String category);

    @Query("SELECT i FROM Itinerary i WHERE "
            + "(:district IS NULL OR i.district = :district) AND "
            + "(:tripWith IS NULL OR i.tripWith = :tripWith) AND "
            + "(:category IS NULL OR i.category = :category)")
    List<Itinerary> findFilteredItineraries(
            @Param("district") String district,
            @Param("tripWith") String tripWith,
            @Param("category") String category);

    List<Itinerary> findByCategoryInAndDistrict(List<String> categories, String district);
}
