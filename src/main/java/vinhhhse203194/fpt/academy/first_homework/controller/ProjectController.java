package vinhhhse203194.fpt.academy.first_homework.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import vinhhhse203194.fpt.academy.first_homework.dto.ProjectRequest;
import vinhhhse203194.fpt.academy.first_homework.dto.ProjectResponse;
import vinhhhse203194.fpt.academy.first_homework.dto.ProjectMemberRequest;
import vinhhhse203194.fpt.academy.first_homework.dto.ProjectMemberResponse;
import vinhhhse203194.fpt.academy.first_homework.entity.User;
import vinhhhse203194.fpt.academy.first_homework.security.CustomUserDetails;
import vinhhhse203194.fpt.academy.first_homework.service.ProjectService;

@Tag(name = "Project Management", description = "Các API quản lý Dự án và Thành viên")
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;

    //Get current user
    private User getCurrentUser(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getUser();
    }

    @Operation(summary = "Tạo dự án mới", description = "Tạo dự án mới và gán quyền OWNER cho người tạo.")
    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(@Valid @RequestBody ProjectRequest request) {
        ProjectResponse response = projectService.createProject(request, getCurrentUser());
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Lấy danh sách dự án", description = "Lấy tất cả các dự án mà bạn là thành viên.")
    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAllProjects() {
        List<ProjectResponse> response = projectService.getAllProjects(getCurrentUser());
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Lấy thông tin chi tiết 1 dự án", description = "Xem chi tiết dự án (chỉ dành cho thành viên của dự án đó).")
    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> getProjectById(@PathVariable Long projectId) {
        ProjectResponse response = projectService.getProjectDetails(getCurrentUser(), projectId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Cập nhật dự án", description = "Đổi tên hoặc mô tả dự án (Yêu cầu quyền OWNER).")
    @PutMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> updateProject(@PathVariable Long projectId, @Valid @RequestBody ProjectRequest request) {
        ProjectResponse response = projectService.updateProject(getCurrentUser(), projectId, request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Xóa dự án", description = "Xóa toàn bộ dự án và các thành viên bên trong (Yêu cầu quyền OWNER hoặc ADMIN).")
    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long projectId) {
        projectService.deleteProject(getCurrentUser(), projectId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Lấy danh sách thành viên", description = "Lấy danh sách tất cả thành viên trong 1 dự án (Yêu cầu là thành viên của dự án).")
    @GetMapping("/{projectId}/members")
    public ResponseEntity<List<ProjectMemberResponse>> getProjectMembers(@PathVariable Long projectId) {
        List<ProjectMemberResponse> response = projectService.getProjectMembers(getCurrentUser(), projectId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Thêm thành viên", description = "Mời một user khác vào dự án bằng Email (Yêu cầu quyền OWNER hoặc ADMIN).")
    @PostMapping("/{projectId}/members")
    public ResponseEntity<ProjectResponse> addMember(@PathVariable Long projectId, @Valid @RequestBody ProjectMemberRequest request) {
        ProjectResponse response = projectService.addMember(getCurrentUser(), projectId, request.getEmail());
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Xóa thành viên", description = "Đuổi 1 thành viên ra khỏi dự án (Yêu cầu quyền OWNER hoặc ADMIN).")
    @DeleteMapping("/{projectId}/members/{memberId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long projectId, @PathVariable Long memberId) {
        projectService.deleteMember(getCurrentUser(), projectId, memberId);
        return ResponseEntity.ok().build();
    }
}
