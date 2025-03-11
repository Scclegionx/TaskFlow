package mobile_be.mobile_be;

import mobile_be.mobile_be.Config.FirebaseInitializer;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MobileBeApplication {

	public static void main(String[] args) {
		FirebaseInitializer.initializeFirebase();
		SpringApplication.run(MobileBeApplication.class, args);
	}

}