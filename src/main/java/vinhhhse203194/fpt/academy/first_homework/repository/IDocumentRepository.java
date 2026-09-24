package vinhhhse203194.fpt.academy.first_homework.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vinhhhse203194.fpt.academy.first_homework.entity.Document;
import java.util.List;

@Repository
public interface IDocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByProjectId(Long projectId);

    @Query("SELECT d FROM Document d JOIN d.project p JOIN p.projectMembers pm WHERE pm.user.id = :userId AND LOWER(d.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Document> searchDocumentsForUser(@Param("userId") Long userId, @Param("keyword") String keyword);
}
