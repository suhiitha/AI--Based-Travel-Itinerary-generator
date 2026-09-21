package Travel_planApi.PlanApi.Controller;

import Travel_planApi.PlanApi.Entity.Events;
import Travel_planApi.PlanApi.Repository.EventsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventsController {

    @Autowired
    private EventsRepository r9e;

    @GetMapping("/getevent")
    public List<Events> getAllEvents() {
        return r9e.findAll();
    }

    @GetMapping("/district/{id}")
    public ResponseEntity<Events> getEventById(@PathVariable Long id) {
        return r9e.findById(id)
                .map(x -> ResponseEntity.ok(x))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/events")
    public ResponseEntity<?> createEvent(@RequestBody Events e1) {
        Events x = r9e.save(e1);
        return ResponseEntity.ok(x);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Events> updateEvent(@PathVariable Long id, @RequestBody Events e2) {
        return r9e.findById(id)
                .map(x -> {
                    x.setDistrict(e2.getDistrict());
                    x.setDescription(e2.getDescription());
                    x.setLocationUrl(e2.getLocationUrl());
                    r9e.save(x);
                    return ResponseEntity.ok(x);
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteEvent(@PathVariable Long id) {
        if (r9e.existsById(id)) {
            r9e.deleteById(id);
            return ResponseEntity.ok("Event deleted successfully.");
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/bydistrict/{district}")
    public List<Events> getEventsByDistrict(@PathVariable String district) {
        return r9e.findByDistrictIgnoreCase(district);
    }
}
