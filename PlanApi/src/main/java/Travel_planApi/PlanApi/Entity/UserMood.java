package Travel_planApi.PlanApi.Entity;

import jakarta.persistence.*;

@Entity
public class UserMood {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String mood;

    public String getMood() {
        return mood;
    }

    public void setMood(String mood) {
        this.mood = mood;
    }
}
