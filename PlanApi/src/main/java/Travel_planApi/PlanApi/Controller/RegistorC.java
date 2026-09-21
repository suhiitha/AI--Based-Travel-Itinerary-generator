package Travel_planApi.PlanApi.Controller;

import Travel_planApi.PlanApi.Entity.Registor;
import Travel_planApi.PlanApi.Repository.RegisterInter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registor")
public class RegistorC {

    @Autowired
    private RegisterInter reg;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/all")
    public List<Registor> getall() {
        return reg.findAll();
    }

    @PostMapping("/PostR")
    public String push(@RequestBody Registor obj) {
        // Hash the password before saving
        obj.setPassword(passwordEncoder.encode(obj.getPassword()));
        reg.save(obj);
        return "Data Posted";
    }

    @DeleteMapping("/delete/{id}")
    public org.springframework.http.ResponseEntity<String> deleteUser(@PathVariable Integer id) {
        if (!reg.existsById(id)) {
            return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND).body("User not found");
        }
        reg.deleteById(id);
        return org.springframework.http.ResponseEntity.ok("User deleted successfully");
    }

    @PutMapping("/update/{id}")
    public org.springframework.http.ResponseEntity<?> updateUser(@PathVariable Integer id, @RequestBody Registor updateDetails) {
        var existingUser = reg.findById(id).orElse(null);
        if (existingUser == null) {
            return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND).body("User not found");
        }
        
        // Only update username for now as per plan
        if (updateDetails.getUsername() != null && !updateDetails.getUsername().trim().isEmpty()) {
            existingUser.setUsername(updateDetails.getUsername());
        }
        
        reg.save(existingUser);
        
        // Return the updated user info without password
        existingUser.setPassword(null);
        return org.springframework.http.ResponseEntity.ok(existingUser);
    }
}
