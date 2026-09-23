package vinhhhse203194.fpt.academy.first_homework.config;

import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioConfig {

    // Đọc giá trị từ application.properties
    @Value("${minio.url}")
    private String url;

    @Value("${minio.access.key}")
    private String accessKey;

    @Value("${minio.secret.key}")
    private String secretKey;

    // Khởi tạo Bean MinioClient để Spring quản lý
    @Bean
    public MinioClient minioClient() throws Exception {
        String endpoint = url;
        String basePath = "";
        
        java.net.URL parsedUrl = new java.net.URL(url);
        if (parsedUrl.getPath() != null && !parsedUrl.getPath().isEmpty() && !parsedUrl.getPath().equals("/")) {
            basePath = parsedUrl.getPath();
            endpoint = parsedUrl.getProtocol() + "://" + parsedUrl.getHost() + (parsedUrl.getPort() == -1 ? "" : ":" + parsedUrl.getPort());
        }

        final String pathToInject = basePath;

        okhttp3.OkHttpClient httpClient = new okhttp3.OkHttpClient.Builder()
                .addInterceptor(chain -> {
                    okhttp3.Request request = chain.request();
                    if (!pathToInject.isEmpty()) {
                        okhttp3.HttpUrl newUrl = request.url().newBuilder()
                                .encodedPath(pathToInject + request.url().encodedPath())
                                .build();
                        request = request.newBuilder().url(newUrl).build();
                    }
                    return chain.proceed(request);
                })
                .build();

        return MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .httpClient(httpClient)
                .build();
    }
}
