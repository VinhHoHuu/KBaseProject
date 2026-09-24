package vinhhhse203194.fpt.academy.first_homework.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import vinhhhse203194.fpt.academy.first_homework.service.CloudinaryService;
import vinhhhse203194.fpt.academy.first_homework.service.MinioService;
import vinhhhse203194.fpt.academy.first_homework.service.StorageService;

@Configuration
public class StorageServiceConfig {

    @Value("${storage.type:minio}")
    private String storageType;

    @Value("${cloudinary.url}")
    private String cloudinaryUrl;

    @Bean
    @Primary
    public StorageService storageService(MinioService minioService) {
        if (storageType != null && storageType.trim().equalsIgnoreCase("cloudinary")) {
            System.out.println(">>> Using CloudinaryStorageService <<<");
            return new CloudinaryService(cloudinaryUrl);
        }
        System.out.println(">>> Using MinioStorageService <<<");
        return minioService;
    }
}
