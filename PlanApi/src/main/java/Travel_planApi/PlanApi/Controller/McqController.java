package Travel_planApi.PlanApi.Controller;

import Travel_planApi.PlanApi.Entity.Itinerary;
import Travel_planApi.PlanApi.Repository.ItineraryRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mcq")
public class McqController {

    @Autowired
    private ItineraryRepo itineraryRepo;

    @PostMapping("/classifyMood")
    public ResponseEntity<Map<String, Object>> classifyMood(@RequestBody Map<String, Object> requestData) {
        System.out.println("Received request data: " + requestData);

        List<String> categories = new ArrayList<>();
        Object categoryObj = requestData.get("category");

        if (categoryObj instanceof String) {
            categories.add((String) categoryObj);
        } else if (categoryObj instanceof List<?>) {
            categories = ((List<?>) categoryObj).stream()
                    .map(Object::toString)
                    .collect(Collectors.toCollection(ArrayList::new));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid category format"));
        }

        String travelWith = (String) requestData.get("travelWith");
        String district = (String) requestData.get("district");
        String tripType = (String) requestData.get("tripType");


        if (categories.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Category is required"));
        }

        if ("Kids".equalsIgnoreCase(travelWith) && !categories.contains("Entertainment")) {
            categories.add("Entertainment");
        }if ("Adults".equalsIgnoreCase(travelWith) && !categories.contains("Cultural")) {
            categories.add("Cultural");
        }
        if ("Both".equalsIgnoreCase(travelWith)) {
            if (!categories.contains("Entertainment")) {
                categories.add("Entertainment");
            }
            if (!categories.contains("Cultural")) {
                categories.add("Cultural");
            }
        }

        System.out.println("Final categories after Kids check: " + categories);
        
        // Fetch places based on categories and district
        List<Itinerary> filteredPlaces = itineraryRepo.findByCategoryInAndDistrict(categories, district);
        
        // Filter further based on tripType if provided
        if (tripType != null && !tripType.isEmpty()) {
            filteredPlaces = filteredPlaces.stream()
                .filter(place -> tripType.equalsIgnoreCase(place.getTripWith()))
                .collect(Collectors.toList());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("mood", categories);
        response.put("places", filteredPlaces);

        return ResponseEntity.ok(response);
    }

}
