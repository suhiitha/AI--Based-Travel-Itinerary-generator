package Travel_planApi.PlanApi.Controller;

import Travel_planApi.PlanApi.Entity.Adminlogin;
import Travel_planApi.PlanApi.Repository.AdminLogrepo;
import Travel_planApi.PlanApi.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminLog {
    @Autowired
    private AdminLogrepo adminLogrepo;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Adminlogin adminlogin) {
        Adminlogin admin = adminLogrepo.findByUsername(adminlogin.getUsername());

        if (admin == null) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        if (!passwordEncoder.matches(adminlogin.getPassword(), admin.getPassword())) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        // Generate JWT with ADMIN role
        String token = jwtUtil.generateToken(admin.getUsername(), "ADMIN");

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("username", admin.getUsername());
        response.put("id", admin.getId());
        // NO password in response

        return ResponseEntity.ok(response);
    }

    @PostMapping("/add")
    public ResponseEntity<String> addAdmin(@RequestBody Adminlogin adminlogin) {
        // Hash the password before saving
        adminlogin.setPassword(passwordEncoder.encode(adminlogin.getPassword()));
        adminLogrepo.save(adminlogin);
        return ResponseEntity.ok("Admin added successfully");
    }

    @GetMapping("/getdata")
    public ResponseEntity<List<Adminlogin>> getAllItineraries() {
        List<Adminlogin> adminLogins = adminLogrepo.findAll();
        return ResponseEntity.ok(adminLogins);
    }

    @GetMapping("/categories")
    public List<String> getCategories() {
        return Arrays.asList("Adventurous", "Relaxed", "Romantic", "Cultural", "Social & Fun", "Spiritual", "Entertainment");
    }

    @GetMapping("/tripTypes")
    public List<String> getTripTypes() {
        return Arrays.asList("Solo", "Family", "Couple", "Friends", "Backpacking");
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody Adminlogin updatedAdmin) {
        Adminlogin admin = adminLogrepo.findById(id).orElse(null);
        if (admin == null) {
            return ResponseEntity.notFound().build();
        }
        admin.setUsername(updatedAdmin.getUsername());
        admin.setFullName(updatedAdmin.getFullName());
        admin.setPhone(updatedAdmin.getPhone());
        adminLogrepo.save(admin);
        return ResponseEntity.ok("Profile updated successfully");
    }

    @PutMapping("/change-password/{id}")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Adminlogin admin = adminLogrepo.findById(id).orElse(null);
        if (admin == null) {
            return ResponseEntity.notFound().build();
        }

        String currentPassword = payload.get("currentPassword");
        String newPassword = payload.get("newPassword");

        if (!passwordEncoder.matches(currentPassword, admin.getPassword())) {
            return ResponseEntity.status(401).body("Incorrect current password");
        }

        admin.setPassword(passwordEncoder.encode(newPassword));
        adminLogrepo.save(admin);
        return ResponseEntity.ok("Password changed successfully");
    }
}