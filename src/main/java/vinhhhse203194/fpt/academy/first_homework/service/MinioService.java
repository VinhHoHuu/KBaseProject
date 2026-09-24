package vinhhhse203194.fpt.academy.first_homework.service;

import com.amazonaws.HttpMethod;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.URL;
import java.util.Date;

@Service
public class MinioService {

    @Autowired
    private AmazonS3 amazonS3;

    @Value("${minio.bucket.name}")
    private String bucketName;

    public void createBucketIfNotExist() throws Exception {
        if (!amazonS3.doesBucketExistV2(bucketName)) {
            amazonS3.createBucket(bucketName);
        }
    }

    // 2. Hàm Upload File lên MinIO
    // Tham số: fileKey (Tên file uuid), file (Dữ liệu file tải lên)
    public void uploadFile(String fileKey, MultipartFile file) throws Exception {
        createBucketIfNotExist(); // Đảm bảo bucket đã tồn tại
        
        InputStream inputStream = file.getInputStream();
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentType(file.getContentType());
        metadata.setContentLength(file.getSize());
        
        amazonS3.putObject(new PutObjectRequest(bucketName, fileKey, inputStream, metadata));
    }

    // 3. Hàm tạo link Download/View tạm thời (Presigned URL - Tồn tại trong 1 giờ)
    public String getPresignedUrl(String fileKey) throws Exception {
        // Thời gian hết hạn là 1 giờ (1000 * 60 * 60 = 3600000 ms)
        Date expiration = new Date();
        long expTimeMillis = expiration.getTime();
        expTimeMillis += 1000 * 60 * 60;
        expiration.setTime(expTimeMillis);
        
        GeneratePresignedUrlRequest generatePresignedUrlRequest = 
                new GeneratePresignedUrlRequest(bucketName, fileKey)
                        .withMethod(HttpMethod.GET)
                        .withExpiration(expiration);
        
        URL url = amazonS3.generatePresignedUrl(generatePresignedUrlRequest);
        return url.toString();
    }

    // 4. Hàm Xóa File khỏi MinIO
    public void deleteFile(String fileKey) throws Exception {
        amazonS3.deleteObject(bucketName, fileKey);
    }
}
