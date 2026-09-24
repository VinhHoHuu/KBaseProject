package vinhhhse203194.fpt.academy.first_homework.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import java.io.InputStream;
import java.net.URL;

public class CloudinaryService implements StorageService {


    private String cloudinaryUrl;

    private Cloudinary cloudinary;

    public CloudinaryService(String cloudinaryUrl) {
        this.cloudinaryUrl = cloudinaryUrl;
        this.cloudinary = new Cloudinary(cloudinaryUrl);
    }

    private String getResourceType(String fileKey) {
        if (fileKey == null || !fileKey.contains(".")) return "raw";
        String ext = fileKey.substring(fileKey.lastIndexOf(".") + 1).toLowerCase();
        if (Arrays.asList("jpg", "jpeg", "png", "gif", "svg", "bmp").contains(ext)) {
            return "image";
        } else if (Arrays.asList("mp4", "mov", "avi").contains(ext)) {
            return "video";
        }
        return "raw";
    }

    @Override
    public void uploadFile(String fileKey, MultipartFile file) throws Exception {
        String resourceType = getResourceType(fileKey);
        // Note: For 'raw' files, Cloudinary requires the extension in public_id if you want it to be preserved in the URL
        // but it's safer to just let it use the fileKey as public_id.
        Map<String, Object> options = ObjectUtils.asMap(
            "public_id", fileKey,
            "resource_type", resourceType
        );
        cloudinary.uploader().upload(file.getBytes(), options);
    }

    @Override
    public String getPresignedUrl(String fileKey) throws Exception {
        String resourceType = getResourceType(fileKey);
        return cloudinary.url().resourceType(resourceType).secure(true).generate(fileKey);
    }

    @Override
    public void deleteFile(String fileKey) throws Exception {
        String resourceType = getResourceType(fileKey);
        cloudinary.uploader().destroy(fileKey, ObjectUtils.asMap("resource_type", resourceType));
    }

    @Override
    public InputStream getFileStream(String fileKey) throws Exception {
        String urlString = getPresignedUrl(fileKey);
        URL url = new URL(urlString);
        return url.openStream();
    }
}
