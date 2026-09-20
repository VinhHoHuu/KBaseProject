package vinhhhse203194.fpt.academy.first_homework.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "Welcome to KBase API! Vui lòng truy cập /swagger-ui/index.html để xem tài liệu API.";
    }
}
