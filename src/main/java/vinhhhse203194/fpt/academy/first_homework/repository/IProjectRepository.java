package vinhhhse203194.fpt.academy.first_homework.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import vinhhhse203194.fpt.academy.first_homework.entity.Project;
import java.util.List;

public interface IProjectRepository extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {
    @Query("SELECT p FROM Project p JOIN p.projectMembers pm WHERE pm.user.id = :userId AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Project> searchProjectsForUser(@Param("userId") Long userId, @Param("keyword") String keyword);
}
