package vinhhhse203194.fpt.academy.first_homework.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import vinhhhse203194.fpt.academy.first_homework.dto.ProjectRequest;
import vinhhhse203194.fpt.academy.first_homework.dto.ProjectResponse;
import vinhhhse203194.fpt.academy.first_homework.entity.Project;
import vinhhhse203194.fpt.academy.first_homework.entity.ProjectMembers;
import vinhhhse203194.fpt.academy.first_homework.entity.User;
import vinhhhse203194.fpt.academy.first_homework.repository.IProjectMemberRepository;
import vinhhhse203194.fpt.academy.first_homework.repository.IProjectRepository;
import vinhhhse203194.fpt.academy.first_homework.repository.IUserRepository;

@Service
public class ProjectService {
    @Autowired
    private IProjectRepository projectRepository;

    @Autowired
    private IProjectMemberRepository projectMemberRepository;

    @Autowired
    private IUserRepository userRepository;

    //Create project
    public ProjectResponse createProject(ProjectRequest request, User currentUser){
        //B1: khởi tạo project entity và đỗ request data vào
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());

        //B2: gán owner cho dự án chính
        project.setOwner(currentUser);

        //B3: lưu vào database
        projectRepository.save(project);

        //B4: Tạo  projectMembers cho owner, gán role "Owner", gán user, gán project
        ProjectMembers projectMember = new ProjectMembers();
        projectMember.setProject(project);
        projectMember.setUser(currentUser);
        projectMember.setRole("OWNER");

        //B5: lưu vào database
        projectMemberRepository.save(projectMember);

        //B6: map response trả về cho FE
        ProjectResponse response = new ProjectResponse();
        response.setId(project.getId());
        response.setName(project.getName());
        response.setDescription(project.getDescription());
        response.setCreatedAt(project.getCreatedAt());
        response.setMyRole("OWNER");

        return response;
    }
    
    //Get all project of current user (owner hoặc member)
    public List<ProjectResponse> getAllProjects(User currentUser){
        //B1: tìm tất cả project id mà user hiện tại là owner hoặc member
        List<ProjectMembers> projectMembers = projectMemberRepository.findByUser(currentUser);

        //B2: truyền list project vào response
        List<ProjectResponse> projects = new ArrayList<>();
        for(ProjectMembers pm : projectMembers){
            projects.add(mapProjectToResponse(pm.getProject(), pm.getRole()));
        }
        return projects;
    }
    
    //GetProject details
    public ProjectResponse getProjectDetails(User currentUser, Long projectId){
        //B1: tìm project theo id
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        //B2:Tìm ProjectMembers để xem currentUser có role gì trong dự án
        ProjectMembers projectMember = projectMemberRepository.findByUserIdAndProjectId(currentUser.getId(), projectId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this project"));

        //B3: truyền dữ liệu vào project response rồi trả về
        return mapProjectToResponse(project, projectMember.getRole());
    }

    //Update project
    public ProjectResponse 
        updateProject(User currentUser, Long projectId, ProjectRequest updateProject){
        //B1: Tìm xem project có tồn tại hay ko
        Project currentProject = projectRepository.findById(projectId)
            .orElseThrow(()-> new RuntimeException("Project not found!"));
        
        //B2: Tìm user và xem user có role là Owner hay ko
        ProjectMembers projectMember = projectMemberRepository.findByUserIdAndProjectId(currentUser.getId(), projectId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this project"));
        
        //nếu ko phải là owner thì ko được update
        if(!projectMember.getRole().equals("OWNER")){
            throw new RuntimeException("You are not owner of this project!");
        }
        
        //B3: Update thông tin của project
        if(updateProject.getName() != null && !updateProject.getName().isEmpty()){
            currentProject.setName(updateProject.getName());
        }
        if(updateProject.getDescription() != null && !updateProject.getDescription().isEmpty()){
            currentProject.setDescription(updateProject.getDescription());
        }

        //B4: Lưu project đã update vào database
        projectRepository.save(currentProject);

        //B5: map project response để trả về
        return mapProjectToResponse(currentProject, projectMember.getRole());
    }


    //Delete project
    public void deleteProject(User currentUser,Long projectId){
        //B1: Tìm project
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found!"));

        //B2: Tìm user và xem user có role là Owner hay ko
        ProjectMembers projectMember = projectMemberRepository.findByUserIdAndProjectId(currentUser.getId(), projectId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this project"));
        
        //nếu ko phải là owner thì ko được xóa
        if(!projectMember.getRole().equals("OWNER") && 
           !projectMember.getRole().equals("ROLE_ADMIN")){
            throw new RuntimeException("You are not owner or admin of this project!");
        }

        //B3: Xóa project
        //Phải xóa projectMember trước khi xóa project, vì nếu không sẽ bị lỗi Foreign key constraint
        projectMemberRepository.deleteAll(projectMemberRepository.findByProject(project));

        projectRepository.delete(project);
    }
    
    //Lấy danh sách thành viên của dự án
    public List<vinhhhse203194.fpt.academy.first_homework.dto.ProjectMemberResponse> getProjectMembers(User currentUser, Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found!"));

        projectMemberRepository.findByUserIdAndProjectId(currentUser.getId(), projectId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this project"));

        List<ProjectMembers> members = projectMemberRepository.findByProject(project);
        List<vinhhhse203194.fpt.academy.first_homework.dto.ProjectMemberResponse> responseList = new ArrayList<>();
        for (ProjectMembers member : members) {
            vinhhhse203194.fpt.academy.first_homework.dto.ProjectMemberResponse res = new vinhhhse203194.fpt.academy.first_homework.dto.ProjectMemberResponse();
            res.setId(member.getUser().getId());
            res.setEmail(member.getUser().getEmail());
            res.setFullName(member.getUser().getFullName());
            res.setRole(member.getRole());
            responseList.add(res);
        }
        return responseList;
    }

    //Thêm thành viên vào dự án
    public ProjectResponse addMember(User currentUser, Long projectId, String email){
        //B1: Tìm project có tồn tại không
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found!"));
        
        //B2: tìm user và xem có phải là owner hay ko, không phải owner thì không được thêm
        ProjectMembers projectMember = projectMemberRepository.findByUserIdAndProjectId(currentUser.getId(), projectId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this project"));
        
        if(!projectMember.getRole().equals("OWNER") &&
           !projectMember.getRole().equals("ROLE_ADMIN")){
            throw new RuntimeException("You are not owner or admin of this project!");
        }
        
        //B3: tìm user muốn add dựa trên email
        User newUser = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found!"));
        
        //B4: Kiểm tra xem user đã là member của project này chưa
        Optional<ProjectMembers> existingMember = projectMemberRepository.findByProjectAndUser(project, newUser);
        //nếu đã là thành viên thì đưa ra thông báo chứ ko thêm vô nữa
        if(existingMember.isPresent()){
            throw new RuntimeException("User is already a member of this project!");
        }

        //B5: Thêm user mới này vào project
        ProjectMembers newMember = new ProjectMembers();
        newMember.setProject(project);
        newMember.setUser(newUser);
        newMember.setRole("MEMBER");

        projectMemberRepository.save(newMember);

        //B6: Trả về project response
        return mapProjectToResponse(project, projectMember.getRole());
    }

    //Xóa thành viên ra khỏi dự án
    public void deleteMember(User currentUser, Long projectId, Long removedUserId){
        //B1: Tìm project có tồn tại không
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found!"));
        
        //B2: tìm user và xem có phải là owner hay ko, không phải owner thì không được thêm
        ProjectMembers projectMember = projectMemberRepository.findByUserIdAndProjectId(currentUser.getId(), projectId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this project"));
        
        if(!projectMember.getRole().equals("OWNER") && 
           !projectMember.getRole().equals("ROLE_ADMIN")){
            throw new RuntimeException("You are not owner or admin of this project!");
        }
        
        //B3: tìm user muốn add dựa trên email
        User userToRemove = userRepository.findById(removedUserId)
            .orElseThrow(() -> new RuntimeException("User not found!"));
        
        //B4: Kiểm tra xem user đã là member của project này chưa
        Optional<ProjectMembers> existingMember = projectMemberRepository
            .findByProjectAndUser(project, userToRemove);
        //nếu không phải thì đưa ra thông báo
        if(!existingMember.isPresent()){
            throw new RuntimeException("User is not a member of this project!");
        }

        //B5: Xóa user ra khỏi project
        projectMemberRepository.delete(existingMember.get());
    }


    ///+++SUPPORTIVE METHOD
    private ProjectResponse mapProjectToResponse(Project project, String role){
        ProjectResponse response = new ProjectResponse();
        response.setId(project.getId());
        response.setName(project.getName());
        response.setDescription(project.getDescription());
        response.setCreatedAt(project.getCreatedAt());
        response.setMyRole(role);
        return response;
    }

    
}
