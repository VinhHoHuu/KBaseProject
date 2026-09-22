package vinhhhse203194.fpt.academy.first_homework.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vinhhhse203194.fpt.academy.first_homework.dto.ProjectRequest;
import vinhhhse203194.fpt.academy.first_homework.dto.ProjectResponse;
import vinhhhse203194.fpt.academy.first_homework.entity.Project;
import vinhhhse203194.fpt.academy.first_homework.entity.ProjectMembers;
import vinhhhse203194.fpt.academy.first_homework.entity.ProjectStatus;
import vinhhhse203194.fpt.academy.first_homework.entity.User;
import vinhhhse203194.fpt.academy.first_homework.repository.IProjectMemberRepository;
import vinhhhse203194.fpt.academy.first_homework.repository.IProjectRepository;
import vinhhhse203194.fpt.academy.first_homework.repository.IUserRepository;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProjectServiceTest {

    @Mock
    private IProjectRepository projectRepository;

    @Mock
    private IProjectMemberRepository projectMemberRepository;

    @Mock
    private IUserRepository userRepository;

    @InjectMocks
    private ProjectService projectService;

    private User currentUser;
    private ProjectRequest projectRequest;
    private Project project;

    @BeforeEach
    void setUp() {
        currentUser = new User();
        currentUser.setId(1L);
        currentUser.setEmail("owner@test.com");
        currentUser.setFullName("Project Owner");

        projectRequest = new ProjectRequest();
        projectRequest.setName("Test Project");
        projectRequest.setDescription("Description of test project");
        projectRequest.setStartDate(LocalDateTime.now());
        projectRequest.setEndDate(LocalDateTime.now().plusDays(10));
        projectRequest.setStatus(ProjectStatus.IN_PROGRESS);

        project = new Project();
        project.setId(10L);
        project.setName(projectRequest.getName());
        project.setDescription(projectRequest.getDescription());
        project.setOwner(currentUser);
    }

    @Test
    void testCreateProject_Success() {
        // Arrange
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project p = invocation.getArgument(0);
            p.setId(10L);
            return p;
        });
        when(projectMemberRepository.save(any(ProjectMembers.class))).thenReturn(new ProjectMembers());

        // Act
        ProjectResponse response = projectService.createProject(projectRequest, currentUser);

        // Assert
        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("Test Project", response.getName());
        
        verify(projectRepository, times(1)).save(any(Project.class));
        verify(projectMemberRepository, times(1)).save(any(ProjectMembers.class));
    }

    @Test
    void testAddMember_Success() {
        // Arrange
        String newMemberEmail = "member@test.com";
        User newMember = new User();
        newMember.setId(2L);
        newMember.setEmail(newMemberEmail);

        ProjectMembers currentMember = new ProjectMembers();
        currentMember.setUser(currentUser);
        currentMember.setProject(project);
        currentMember.setRole("OWNER");

        when(projectRepository.findById(anyLong())).thenReturn(Optional.of(project));
        when(projectMemberRepository.findByUserIdAndProjectId(anyLong(), anyLong())).thenReturn(Optional.of(currentMember));
        when(userRepository.findByEmail(newMemberEmail)).thenReturn(Optional.of(newMember));
        when(projectMemberRepository.findByProjectAndUser(any(Project.class), any(User.class))).thenReturn(Optional.empty());

        // Act
        ProjectResponse response = projectService.addMember(currentUser, 10L, newMemberEmail);

        // Assert
        assertNotNull(response);
        verify(projectMemberRepository, times(1)).save(any(ProjectMembers.class));
    }

    @Test
    void testAddMember_Failure_ProjectNotFound() {
        // Arrange
        when(projectRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            projectService.addMember(currentUser, 99L, "member@test.com")
        );
        assertEquals("Project not found!", exception.getMessage());
    }
}
