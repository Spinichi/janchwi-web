package site.janchwi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class JanchwiBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(JanchwiBackendApplication.class, args);
	}

}
