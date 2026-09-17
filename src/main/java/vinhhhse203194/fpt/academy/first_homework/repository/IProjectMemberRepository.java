package vinhhhse203194.fpt.academy.first_homework.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import vinhhhse203194.fpt.academy.first_homework.entity.Project;
import vinhhhse203194.fpt.academy.first_homework.entity.ProjectMembers;
import vinhhhse203194.fpt.academy.first_homework.entity.User;

public interface IProjectMemberRepository extends JpaRepository<ProjectMembers, Long>, JpaSpecificationExecutor<ProjectMembers> {
    
    // Tìm kiếm xem một người dùng có tham gia dự án này không
    Optional<ProjectMembers> findByProjectAndUser(Project project, User user);
    
    // Lấy danh sách tất cả các dự án mà một người dùng tham gia
    List<ProjectMembers> findByUser(User user);

    //Tìm kiếm user và role của user trong dự án
    Optional<ProjectMembers> findByUserIdAndProjectId(Long userId, Long projectId);

    // Lấy danh sách tất cả các thành viên của một dự án
    List<ProjectMembers> findByProject(Project project);
}
