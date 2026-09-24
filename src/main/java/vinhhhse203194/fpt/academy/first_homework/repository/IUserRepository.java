package vinhhhse203194.fpt.academy.first_homework.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import vinhhhse203194.fpt.academy.first_homework.entity.User;
import java.util.List;
import java.util.Optional;

public interface IUserRepository extends JpaRepository<User, Long> {
    //Tìm kiếm user theo email phục vụ chức năng đăng nhập
    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<User> searchUsers(@Param("keyword") String keyword);
}
