package Travel_planApi.PlanApi.Controller;


import Travel_planApi.PlanApi.Entity.UserMood;
import Travel_planApi.PlanApi.service.UserMoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-mood")
public class UserMoodController {

    @Autowired
    private UserMoodService userMoodService;

    @PostMapping("/recommend")
    public ResponseEntity<List<String>> getRecommendations(@RequestBody UserMood userMood) {
        String mood = userMood.getMood();
        List<String> recommendations = userMoodService.getRecommendations(mood);
        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/recommendations/{mood}")
    public ResponseEntity<List<String>> getRecommendations(@PathVariable String mood) {
        List<String> recommendations = userMoodService.getRecommendations(mood);
        return ResponseEntity.ok(recommendations);
    }
}