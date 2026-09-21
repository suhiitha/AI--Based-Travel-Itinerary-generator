package Travel_planApi.PlanApi.Repository;

import Travel_planApi.PlanApi.Entity.Adminlogin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminLogrepo extends JpaRepository<Adminlogin, Long> {

    Adminlogin findByUsername(String username);
}