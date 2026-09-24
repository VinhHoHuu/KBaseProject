package vinhhhse203194.fpt.academy.first_homework.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vinhhhse203194.fpt.academy.first_homework.dto.DocumentResponse;
import vinhhhse203194.fpt.academy.first_homework.dto.ProjectMemberResponse;
import vinhhhse203194.fpt.academy.first_homework.dto.ProjectResponse;
import vinhhhse203194.fpt.academy.first_homework.dto.SearchResultResponse;
import vinhhhse203194.fpt.academy.first_homework.entity.Document;
import vinhhhse203194.fpt.academy.first_homework.entity.Project;
import vinhhhse203194.fpt.academy.first_homework.entity.ProjectMembers;
import vinhhhse203194.fpt.academy.first_homework.entity.User;
import vinhhhse203194.fpt.academy.first_homework.repository.IDocumentRepository;
import vinhhhse203194.fpt.academy.first_homework.repository.IProjectMemberRepository;
import vinhhhse203194.fpt.academy.first_homework.repository.IProjectRepository;
import vinhhhse203194.fpt.academy.first_homework.repository.IUserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchService {

    @Autowired
    private IProjectRepository projectRepository;

    @Autowired
    private IProjectMemberRepository projectMemberRepository;

    @Autowired
    private IUserRepository userRepository;

    @Autowired
    private IDocumentRepository documentRepository;

    @Autowired
    private ProjectService projectService;
    
    @Autowired
    private MinioService minioService;

    public SearchResultResponse searchGlobal(User currentUser, String keyword) {
        SearchResultResponse response = new SearchResultResponse();
        
        if (keyword == null || keyword.trim().isEmpty()) {
            response.setProjects(new ArrayList<>());
            response.setUsers(new ArrayList<>());
            response.setDocuments(new ArrayList<>());
            return response;
        }

        String searchKey = keyword.trim();

        // 1. Search Projects
        List<Project> matchingProjects = projectRepository.searchProjectsForUser(currentUser.getId(), searchKey);
        List<ProjectResponse> projectResponses = new ArrayList<>();
        for (Project project : matchingProjects) {
            ProjectMembers member = projectMemberRepository.findByUserIdAndProjectId(currentUser.getId(), project.getId()).orElse(null);
            String role = member != null ? member.getRole() : "MEMBER";
            projectResponses.add(projectService.mapProjectToResponse(project, role));
        }
        response.setProjects(projectResponses);

        // 2. Search Users (Members)
        List<User> matchingUsers = userRepository.searchUsers(searchKey);
        List<ProjectMemberResponse> userResponses = matchingUsers.stream().map(u -> {
            ProjectMemberResponse pm = new ProjectMemberResponse();
            pm.setId(u.getId());
            pm.setEmail(u.getEmail());
            pm.setFullName(u.getFullName());
            pm.setRole(u.getRole());
            return pm;
        }).collect(Collectors.toList());
        response.setUsers(userResponses);

        // 3. Search Documents
        List<Document> matchingDocs = documentRepository.searchDocumentsForUser(currentUser.getId(), searchKey);
        List<DocumentResponse> documentResponses = matchingDocs.stream().map(doc -> {
            try {
                String presignedUrl = minioService.getPresignedUrl(doc.getFileKey());
                return new DocumentResponse(doc, presignedUrl);
            } catch (Exception e) {
                return new DocumentResponse(doc, null);
            }
        }).collect(Collectors.toList());
        response.setDocuments(documentResponses);

        return response;
    }
}
