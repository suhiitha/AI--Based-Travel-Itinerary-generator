package Travel_planApi.PlanApi.Controller;
import Travel_planApi.PlanApi.Entity.Itinerary;
import Travel_planApi.PlanApi.service.ItineraryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/itinerary")
public class TripController {

    @Autowired
    private ItineraryService itineraryService;

    @PostMapping("/add")
    public ResponseEntity<Itinerary> addItinerary(@RequestBody Itinerary itinerary) {
        Itinerary savedItinerary = itineraryService.addItinerary(itinerary);
        return ResponseEntity.ok(savedItinerary);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Itinerary> updateItinerary(@PathVariable Long id, @RequestBody Itinerary itinerary) {
        Itinerary updatedItinerary = itineraryService.updateItinerary(id, itinerary);
        return ResponseEntity.ok(updatedItinerary);
    }
    @GetMapping("/byIds")
    public ResponseEntity<List<Itinerary>> getPlacesByIds(@RequestParam List<Long> ids) {
        List<Itinerary> places = itineraryService.getPlacesByIds(ids);
        return ResponseEntity.ok(places);
    }

    @GetMapping("/district/{district}")
    public ResponseEntity<List<Itinerary>> getPlacesByDistrict(@PathVariable String district) {
        List<Itinerary> places = itineraryService.getPlacesByDistrict(district);
        return places.isEmpty() ? ResponseEntity.notFound().build() : ResponseEntity.ok(places);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Itinerary>> getAllItineraries() {
        return ResponseEntity.ok(itineraryService.getAllItineraries());
    }

    @GetMapping("/filter")
    public ResponseEntity<List<Itinerary>> filterItinerary(
            @RequestParam List<String> category,
            @RequestParam String district) {
        List<Itinerary> filteredPlaces = itineraryService.getPlacesByCategoriesAndDistrict(category, district);
        return ResponseEntity.ok(filteredPlaces);
    }

    @GetMapping("/districts")
    public ResponseEntity<List<String>> getAllDistricts() {
        return ResponseEntity.ok(itineraryService.getAllDistricts());
    }

    @GetMapping("/nearbyPlaces")
    public ResponseEntity<List<Itinerary>> getNearbyPlaces(
            @RequestParam String district,
            @RequestParam String category) {

        List<Itinerary> nearbyPlaces = itineraryService.getPlacesByCategoriesAndDistrict(List.of(category), district);
        return nearbyPlaces.isEmpty() ? ResponseEntity.notFound().build() : ResponseEntity.ok(nearbyPlaces);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteItinerary(@PathVariable Long id) {
        try {
            itineraryService.deleteItinerary(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}
