package Travel_planApi.PlanApi.Controller;

import Travel_planApi.PlanApi.Entity.Itinerary;
import Travel_planApi.PlanApi.Repository.ItineraryRepo;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;

@RestController
@RequestMapping("/api/mcq")
public class PlaceController {

    private final ItineraryRepo itineraryRepo;

    public PlaceController(ItineraryRepo itineraryRepo) {
        this.itineraryRepo = itineraryRepo;
    }

    @GetMapping("/places")
    public ResponseEntity<List<Itinerary>> getPlacesByCategory(@RequestParam String category) {
        List<Itinerary> places = itineraryRepo.findByCategory(category);
        return ResponseEntity.ok(places);
    }
}
