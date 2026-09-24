package vinhhhse203194.fpt.academy.first_homework.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vinhhhse203194.fpt.academy.first_homework.dto.DocumentResponse;
import vinhhhse203194.fpt.academy.first_homework.entity.*;
import vinhhhse203194.fpt.academy.first_homework.repository.IDocumentRepository;
import vinhhhse203194.fpt.academy.first_homework.repository.IProjectRepository;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class DocumentService {

    @Autowired
    private StorageService storageService;
    
    @Autowired
    private IDocumentRepository documentRepository;
    
    @Autowired
    private IProjectRepository projectRepository;
    
    @Autowired
    private ProjectService projectService;

    //Các đuôi file cho phép upload lên
    private final List<String> allowedExtensions = Arrays.asList(
            "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "md",
            "jpg", "jpeg", "png", "gif", "svg", "bmp",
            "mp4", "mov", "avi"
    );

    //1.Upload file method
    public DocumentResponse uploadDocument(MultipartFile file,Long projectId,User currentUser) throws Exception {
        //b1: lấy thông tin project ra
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        // Bước 2: Kiểm tra xem currentUser có phải là thành viên hoặc Owner của Project này không?
        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());
        boolean isMember = project.getProjectMembers().stream().
                anyMatch(pm -> pm.getUser().getId().equals(currentUser.getId()));

        if (!isOwner && !isMember) {
            throw new RuntimeException("You are not a member of this project!");
        }

        //Bước 3: lấy đuôi file và kiểm tra xem có nằm trong danh sách allowedExtensions hay ko
        String orginalFileName = file.getOriginalFilename();
        if (orginalFileName == null || !orginalFileName.contains(".")) {
            throw new RuntimeException("Invalid file name");
        }
        String fileExtension = orginalFileName.substring(orginalFileName.lastIndexOf(".") + 1).toLowerCase();

        if(!allowedExtensions.contains(fileExtension)){
            throw new RuntimeException("Invalid file type: " + fileExtension);
        }

        //Bước 4: Tạo tên file duy nhất (tránh trùng) để upload lên MinIO
        String fileKey = UUID.randomUUID().toString() + "." + fileExtension;

        //Bước 5: Upload file lên MinIO
        try{
            storageService.uploadFile(fileKey, file);
        }catch(Exception e){
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }

        //Bước 6: Lưu thông tin file vào database
        Document document = new Document();
        document.setName(orginalFileName);
        document.setType(file.getContentType());
        document.setSize(file.getSize());
        document.setFileKey(fileKey);
        document.setProject(project);
        document.setUploadedBy(currentUser);
        documentRepository.save(document);

        //Bước 7: Tạo Presigned URL để cho phép client tải file
        String presignedUrl = storageService.getPresignedUrl(fileKey);

        //Bước 8: Trả về document response cho client
        return new DocumentResponse(document, presignedUrl);
    }

    //Lấy danh sách toàn bộ file của 1 project
    public List<DocumentResponse> getAllDocuments(Long projectId,User currentUser)
            throws Exception{
        //bước 1: kiểm tra xem dự án có tồn tại hay ko
        Project project = projectRepository.findById(projectId)
            .orElseThrow(()-> new RuntimeException("Project not found!"));
        
        //Bước 2: kiểm tra quyền truy cập(phải là member mới được xem)
        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());
        boolean isMember = project.getProjectMembers().stream().
                anyMatch(pm -> pm.getUser().getId().equals(currentUser.getId()));
        
        if(!isOwner && !isMember){
            throw new RuntimeException("You are not a member of this project!");
        }

        //Bước 3: lấy toàn bộ document từ database dựa vào projectId
        List<Document> documents = documentRepository.findByProjectId(projectId);

        //Bước 4: chuyển đổi từ entity sang DTO và tạo Presigned url mới cho mỗi file
        List<DocumentResponse> responses = new ArrayList<>();
        for(Document doc : documents){
            String presignedUrl = storageService.getPresignedUrl(doc.getFileKey());
            responses.add(new DocumentResponse(doc, presignedUrl));
        }

        return responses;    
    }

    //Xóa một file
    public void deleteDocument(Long projectId, User currentUser, Long documentId) 
            throws Exception{
        //Bước 1: kiểm tra xem dự án có tồn tại hay ko
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found!"));

        //Bước 2: Kiểm tra xem user hiện tại có quyền xóa file ko
        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());
        boolean isMember = project.getProjectMembers().stream().
                anyMatch(pm -> pm.getUser().getId().equals(currentUser.getId()));
        
        if(!isOwner && !isMember){
            throw new RuntimeException("You are not a member of this project!");
        }

        //Bước 3: Tìm document trong database
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found!"));

        //Bước 4: Kiểm tra xem document có thuộc về project hay ko
        if(!document.getProject().getId().equals(projectId)){
            throw new RuntimeException("Document not found in this project!");
        }

        //Bước 5: Xóa file khỏi MinIO
        try{
            storageService.deleteFile(document.getFileKey());
        }catch(Exception e){
            throw new RuntimeException("Failed to delete file: " + e.getMessage());
        }

        //Bước 6: Xóa document khỏi database
        documentRepository.delete(document);
    }

    
}
