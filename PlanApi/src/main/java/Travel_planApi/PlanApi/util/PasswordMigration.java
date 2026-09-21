// Password migration utility — hashes any plaintext passwords on startup
package Travel_planApi.PlanApi.util;

import Travel_planApi.PlanApi.Entity.Adminlogin;
import Travel_planApi.PlanApi.Entity.Registor;
import Travel_planApi.PlanApi.Repository.AdminLogrepo;
import Travel_planApi.PlanApi.Repository.RegisterInter;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PasswordMigration {

    private static final Logger logger = LoggerFactory.getLogger(PasswordMigration.class);

    @Autowired
    private RegisterInter registerRepo;

    @Autowired
    private AdminLogrepo adminRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostConstruct
    public void migratePasswords() {
        logger.info("=== PASSWORD MIGRATION STARTED ===");

        migrateUserPasswords();
        migrateAdminPasswords();

        logger.info("=== PASSWORD MIGRATION COMPLETE ===");
    }

    private void migrateUserPasswords() {
        logger.info("--- Migrating user passwords (registor table) ---");
        List<Registor> users = registerRepo.findAll();

        int migrated = 0;
        int skipped = 0;

        for (Registor user : users) {
            String email = user.getUseremail();
            String currentPassword = user.getPassword();

            if (currentPassword == null || currentPassword.isEmpty()) {
                logger.warn("Skipped (empty password): {}", email);
                skipped++;
                continue;
            }

            if (isAlreadyBCrypt(currentPassword)) {
                logger.info("Skipped (already hashed): {}", email);
                skipped++;
            } else {
                user.setPassword(passwordEncoder.encode(currentPassword));
                registerRepo.save(user);
                logger.info("Migrated user: {}", email);
                migrated++;
            }
        }

        logger.info("Users — migrated: {}, skipped: {}, total: {}", migrated, skipped, users.size());
    }

    private void migrateAdminPasswords() {
        logger.info("--- Migrating admin passwords (adminlogin table) ---");
        List<Adminlogin> admins = adminRepo.findAll();

        int migrated = 0;
        int skipped = 0;

        for (Adminlogin admin : admins) {
            String username = admin.getUsername();
            String currentPassword = admin.getPassword();

            if (currentPassword == null || currentPassword.isEmpty()) {
                logger.warn("Skipped (empty password): {}", username);
                skipped++;
                continue;
            }

            if (isAlreadyBCrypt(currentPassword)) {
                logger.info("Skipped (already hashed): {}", username);
                skipped++;
            } else {
                admin.setPassword(passwordEncoder.encode(currentPassword));
                adminRepo.save(admin);
                logger.info("Migrated admin: {}", username);
                migrated++;
            }
        }

        logger.info("Admins — migrated: {}, skipped: {}, total: {}", migrated, skipped, admins.size());
    }

    private boolean isAlreadyBCrypt(String password) {
        return password != null && (password.startsWith("$2a$") || password.startsWith("$2b$") || password.startsWith("$2y$"));
    }
}
