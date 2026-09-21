package Travel_planApi.PlanApi.service;

import Travel_planApi.PlanApi.Entity.Itinerary;
import Travel_planApi.PlanApi.Repository.ItineraryRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ItineraryService {

    @Autowired
    private ItineraryRepo itineraryRepository;

    public List<Itinerary> getPlacesByIds(List<Long> ids) {
        return itineraryRepository.findAllById(ids);
    }

    public Itinerary addItinerary(Itinerary itinerary) {
        return itineraryRepository.save(itinerary);
    }

    public List<String> getAllDistricts() {
        return itineraryRepository.findAllDistinctDistricts();
    }

    public Itinerary updateItinerary(Long id, Itinerary itinerary) {
        Optional<Itinerary> existingItinerary = itineraryRepository.findById(id);
        if (existingItinerary.isPresent()) {
            itinerary.setId(id);
            return itineraryRepository.save(itinerary);
        } else {
            throw new RuntimeException("Itinerary not found with ID: " + id);
        }
    }

    public List<Itinerary> getPlacesByDistrict(String district) {
        return itineraryRepository.findByDistrict(district);
    }

    public List<Itinerary> getPlacesByCategoriesAndDistrict(List<String> categories, String district) {
        return itineraryRepository.findByCategoryInAndDistrict(categories, district);
    }

    public void deleteItinerary(Long id) {
        if (!itineraryRepository.existsById(id)) {
            throw new RuntimeException("Itinerary not found with ID: " + id);
        }
        itineraryRepository.deleteById(id);
    }

    public List<Itinerary> getAllItineraries() {
        return itineraryRepository.findAll();
    }
}
