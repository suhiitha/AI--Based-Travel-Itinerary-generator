package Travel_planApi.PlanApi.dto;

public class LoginResponse {
    private String token;
    private String username;
    private String useremail;
    private int id;

    public LoginResponse() {}

    public LoginResponse(String token, String username, String useremail, int id) {
        this.token = token;
        this.username = username;
        this.useremail = useremail;
        this.id = id;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getUseremail() { return useremail; }
    public void setUseremail(String useremail) { this.useremail = useremail; }
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
}
