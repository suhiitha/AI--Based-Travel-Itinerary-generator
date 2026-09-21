package Travel_planApi.PlanApi.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "trip_places")
public class TripPlace {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer rating;
    private String district;
    private int days;
    private String category;
    private String user;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String placeids;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String places;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String statusJson;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String review;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public int getDays() { return days; }
    public void setDays(int days) { this.days = days; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getUser() { return user; }
    public void setUser(String user) { this.user = user; }
    public String getPlaceids() { return placeids; }
    public void setPlaceids(String placeids) { this.placeids = placeids; }
    public String getPlaces() { return places; }
    public void setPlaces(String places) { this.places = places; }
    public String getStatusJson() { return statusJson; }
    public void setStatusJson(String statusJson) { this.statusJson = statusJson; }
    public String getReview() { return review; }
    public void setReview(String review) { this.review = review; }
}