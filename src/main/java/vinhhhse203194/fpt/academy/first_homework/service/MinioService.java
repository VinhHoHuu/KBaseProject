package vinhhhse203194.fpt.academy.first_homework.service;

import io.minio.*;
import io.minio.http.Method;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.concurrent.TimeUnit;

@Service
public class MinioService {

    @Autowired
    private MinioClient minioClient;

    // Lấy tên bucket từ application.properties
    @Value("${minio.bucket.name}")
    private String bucketName;

    // 1. Hàm tạo Bucket nếu chưa có (Có thể gọi hàm này mỗi lần khởi động hoặc khi upload)
    public void createBucketIfNotExist() throws Exception {
        boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
        if (!found) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
        }
    }

    // 2. Hàm Upload File lên MinIO
    // Tham số: fileKey (Tên file uuid), file (Dữ liệu file tải lên)
    public void uploadFile(String fileKey, MultipartFile file) throws Exception {
        createBucketIfNotExist(); // Đảm bảo bucket đã tồn tại
        
        // Mở luồng đọc dữ liệu từ file
        InputStream inputStream = file.getInputStream();
        
        // Gọi lệnh putObject để đẩy lên MinIO
        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(fileKey)
                        .stream(inputStream, file.getSize(), -1)
                        .contentType(file.getContentType()) // Lưu định dạng file
                        .build()
        );
    }

    // 3. Hàm tạo link Download/View tạm thời (Presigned URL - Tồn tại trong 1 giờ)
    public String getPresignedUrl(String fileKey) throws Exception {
        return minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .method(Method.GET)
                        .bucket(bucketName)
                        .object(fileKey)
                        .expiry(1, TimeUnit.HOURS)
                        .build()
        );
    }

    // 4. Hàm Xóa File khỏi MinIO
    public void deleteFile(String fileKey) throws Exception {
        minioClient.removeObject(
                RemoveObjectArgs.builder()
                        .bucket(bucketName)
                        .object(fileKey)
                        .build()
        );
    }
}
