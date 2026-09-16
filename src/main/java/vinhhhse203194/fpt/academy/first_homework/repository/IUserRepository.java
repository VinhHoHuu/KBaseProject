package vinhhhse203194.fpt.academy.first_homework.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import vinhhhse203194.fpt.academy.first_homework.entity.User;
import java.util.Optional;

public interface IUserRepository extends JpaRepository<User, Long> {
    //Tìm kiếm user theo email phục vụ chức năng đăng nhập
    Optional<User> findByEmail(String email);
}
