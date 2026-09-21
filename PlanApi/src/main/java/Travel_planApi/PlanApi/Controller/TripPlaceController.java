package Travel_planApi.PlanApi.Controller;

import Travel_planApi.PlanApi.Entity.TripPlace;
import Travel_planApi.PlanApi.Repository.TripPlaceRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trip-places")
public class TripPlaceController {

    @Autowired
    private TripPlaceRepository tripPlaceRepository;

    @PostMapping("/save")
    public ResponseEntity<String> saveItinerary(@RequestBody TripPlace tripItinerary) {
        System.out.println("Received Itinerary: " + tripItinerary);

        if (tripItinerary.getDistrict() == null || tripItinerary.getDistrict().isEmpty()) {
            return ResponseEntity.badRequest().body("District is required.");
        }
        if (tripItinerary.getDays() <= 0) {
            return ResponseEntity.badRequest().body("Number of days must be greater than 0.");
        }
        if (tripItinerary.getCategory() == null || tripItinerary.getCategory().isEmpty()) {
            return ResponseEntity.badRequest().body("At least one category is required.");
        }

        if (tripItinerary.getRating() == null) {
            tripItinerary.setRating(5);
        }

        tripPlaceRepository.save(tripItinerary);
        return ResponseEntity.ok("Itinerary saved successfully!");
    }

    @GetMapping("/all")
    public ResponseEntity<List<TripPlace>> getAllItineraries() {
        return ResponseEntity.ok(tripPlaceRepository.findAll());
    }
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteTripPlace(@PathVariable Long id) {
        tripPlaceRepository.deleteById(id);
        return ResponseEntity.ok("Deleted Successfully");
    }
    @PutMapping("/updateview/{id}")
    public ResponseEntity<String> updateFeedbackAndRating(
            @RequestBody TripPlace obj,
            @PathVariable int id) {

        Optional<TripPlace> existingTripPlaceOpt = tripPlaceRepository.findById((long) id);

        if (existingTripPlaceOpt.isPresent()) {
            TripPlace existingTripPlace = existingTripPlaceOpt.get();

            // Update review if provided in the request
            if (obj.getReview() != null) {
                existingTripPlace.setReview(obj.getReview());
            }

            // Update rating if provided in the request (and validate it)
            if (obj.getRating() != null) {
                if (obj.getRating() >= 1 && obj.getRating() <= 5) {
                    existingTripPlace.setRating(obj.getRating());
                } else {
                    return ResponseEntity.badRequest().body("Rating must be between 1 and 5");
                }
            }

            tripPlaceRepository.save(existingTripPlace);
            return ResponseEntity.ok("Feedback and rating updated successfully");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("TripPlace not found");
        }
    }

    @PutMapping("/updatestatus/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> statusData) {
        Optional<TripPlace> existingTripPlaceOpt = tripPlaceRepository.findById(id);

        if (existingTripPlaceOpt.isPresent()) {
            TripPlace tripPlace = existingTripPlaceOpt.get();
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                String statusJson = objectMapper.writeValueAsString(statusData);
                tripPlace.setStatusJson(statusJson);
                tripPlaceRepository.save(tripPlace);
                return ResponseEntity.ok("Status updated successfully");
            } catch (JsonProcessingException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to convert status to JSON");
            }
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("TripPlace not found");
        }
    }

    @GetMapping("/feedbacks")
    public ResponseEntity<List<TripPlace>> getUserFeedbacks(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String category) {
        
        List<TripPlace> feedbacks = tripPlaceRepository.findAll().stream()
            .filter(tp -> tp.getReview() != null && !tp.getReview().isEmpty())
            .filter(tp -> district == null || district.isEmpty() || district.equalsIgnoreCase(tp.getDistrict()))
            .filter(tp -> category == null || category.isEmpty() || (tp.getCategory() != null && tp.getCategory().contains(category)))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(feedbacks);
    }

}
