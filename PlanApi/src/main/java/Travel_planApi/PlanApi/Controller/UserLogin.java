package Travel_planApi.PlanApi.Controller;

import Travel_planApi.PlanApi.Entity.Registor;
import Travel_planApi.PlanApi.Repository.RegisterInter;
import Travel_planApi.PlanApi.dto.LoginResponse;
import Travel_planApi.PlanApi.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserLogin {

    @Autowired
    private RegisterInter repo;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/ulogin")
    public ResponseEntity<?> ulogin(@RequestBody Registor obj) {
        var user = repo.findByuseremail(obj.getUseremail())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not found");
        }

        if (!passwordEncoder.matches(obj.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid Password");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getUseremail());

        // Return token + user info WITHOUT password
        LoginResponse response = new LoginResponse(
                token,
                user.getUsername(),
                user.getUseremail(),
                user.getId()
        );

        return ResponseEntity.ok(response);
    }
}
