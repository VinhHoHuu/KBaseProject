package vinhhhse203194.fpt.academy.first_homework.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vinhhhse203194.fpt.academy.first_homework.entity.ChatMessage;

import java.util.List;

@Repository
public interface IChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    // Lấy lịch sử chat của user trong project, sắp xếp theo thời gian tăng dần
    List<ChatMessage> findByProjectIdAndUserIdOrderByCreatedAtAsc(Long projectId, Long userId);

    // Xóa toàn bộ lịch sử chat của user trong project
    void deleteByProjectIdAndUserId(Long projectId, Long userId);
}
