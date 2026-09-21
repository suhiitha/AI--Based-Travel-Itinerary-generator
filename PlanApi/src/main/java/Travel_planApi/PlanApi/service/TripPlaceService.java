package Travel_planApi.PlanApi.service;

// TODO: UNUSED — TripPlaceController accesses TripPlaceRepository directly.
// Keeping this service for potential future refactoring to proper service layer.
// Safe to delete if service layer pattern is not adopted.
import Travel_planApi.PlanApi.Entity.TripPlace;
import Travel_planApi.PlanApi.Repository.TripPlaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TripPlaceService {

    @Autowired
    private TripPlaceRepository tripPlaceRepository;

    public TripPlace saveTripPlace(TripPlace tripPlace) {
        return tripPlaceRepository.save(tripPlace);
    }

    public List<TripPlace> getAllTripPlaces() {
        return tripPlaceRepository.findAll();
    }

    public void deleteTripPlace(Long id) {
        tripPlaceRepository.deleteById(id);
    }
}
