package Travel_planApi.PlanApi.Repository;

import Travel_planApi.PlanApi.Entity.Registor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RegisterInter extends JpaRepository<Registor,Integer> {
    Optional<Registor>findByuseremail(String useremail);

}
