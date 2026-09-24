package vinhhhse203194.fpt.academy.first_homework.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    void uploadFile(String fileKey, MultipartFile file) throws Exception;
    String getPresignedUrl(String fileKey) throws Exception;
    void deleteFile(String fileKey) throws Exception;
}
