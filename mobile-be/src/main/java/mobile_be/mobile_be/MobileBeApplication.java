package mobile_be.mobile_be;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MobileBeApplication {

	public static void main(String[] args) {
		SpringApplication.run(MobileBeApplication.class, args);
	}

}
