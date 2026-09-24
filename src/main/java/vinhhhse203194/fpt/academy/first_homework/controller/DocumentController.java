package vinhhhse203194.fpt.academy.first_homework.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vinhhhse203194.fpt.academy.first_homework.dto.DocumentResponse;
import vinhhhse203194.fpt.academy.first_homework.entity.User;
import vinhhhse203194.fpt.academy.first_homework.security.CustomUserDetails;
import vinhhhse203194.fpt.academy.first_homework.service.DocumentService;

@RestController
@RequestMapping("/api/projects/{projectId}/documents")
@Tag(name = "Document Management", description = "Các API liên quan đến File/Tài liệu của Dự án")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload File", description = "Tải một file lên dự án. Giới hạn 100MB.")
    public ResponseEntity<?> uploadDocument(
            @PathVariable Long projectId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails) throws Exception {
        
        User currentUser = userDetails.getUser();
        DocumentResponse response = documentService.uploadDocument(file, projectId, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách File", description = "Xem tất cả các file đã upload trong dự án.")
    public ResponseEntity<?> getAllDocuments(
            @PathVariable Long projectId,
            @AuthenticationPrincipal CustomUserDetails userDetails) throws Exception {
            
        User currentUser = userDetails.getUser();
        return ResponseEntity.ok(documentService.getAllDocuments(projectId, currentUser));
    }

    @DeleteMapping("/{documentId}")
    @Operation(summary = "Xóa File", description = "Xóa file khỏi dự án. Chỉ Owner hoặc người upload mới được xóa.")
    public ResponseEntity<?> deleteDocument(
            @PathVariable Long projectId,
            @PathVariable Long documentId,
            @AuthenticationPrincipal CustomUserDetails userDetails) throws Exception {
            
        User currentUser = userDetails.getUser();
        documentService.deleteDocument(projectId, currentUser, documentId);
        return ResponseEntity.ok(java.util.Map.of("message", "Xóa file thành công!"));
    }
}
