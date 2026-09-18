<div align="center">
  <h1>🚀 KBase - Project Management API</h1>
  <p>
    Hệ thống API Quản lý Dự án mạnh mẽ, bảo mật và linh hoạt được xây dựng trên nền tảng <b>Spring Boot 3</b> & <b>Java 21</b>.
  </p>
  <p>
    <img src="https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=java" alt="Java 21">
    <img src="https://img.shields.io/badge/Spring_Boot-3.4.0-brightgreen?style=for-the-badge&logo=spring" alt="Spring Boot">
    <img src="https://img.shields.io/badge/PostgreSQL-15-blue?style=for-the-badge&logo=postgresql" alt="PostgreSQL">
    <img src="https://img.shields.io/badge/MinIO-S3_Storage-red?style=for-the-badge&logo=minio" alt="MinIO">
    <img src="https://img.shields.io/badge/Security-JWT-red?style=for-the-badge&logo=springsecurity" alt="JWT Security">
    <img src="https://img.shields.io/badge/CI/CD-GitHub_Actions-black?style=for-the-badge&logo=githubactions" alt="GitHub Actions">
  </p>
</div>

---

## 🌟 Giới thiệu (Introduction)
**KBase** là một hệ thống Backend API (tương tự Jira/Trello thu nhỏ) cung cấp các giải pháp quản lý dự án dành cho nhóm làm việc. Dự án tập trung vào tính năng bảo mật với hệ thống xác thực JWT, phân quyền thao tác người dùng, và tối ưu hóa hiệu suất với Hibernate/JPA.

---

## ⚙️ Tính năng nổi bật (Features)

### 🔐 1. Quản lý Xác thực & Bảo mật (Authentication)
- **Đăng ký / Đăng nhập** tài khoản.
- Mã hóa mật khẩu an toàn với **Bcrypt**.
- Cấp phát và xác thực bằng thẻ **JSON Web Token (JWT)**.
- Xử lý lỗi 401 Unauthorized chuyên nghiệp bằng chuẩn JSON.

### 🗂️ 2. Quản lý Dự án (Project Management)
- Thiết kế API chuẩn **RESTful** (GET, POST, PUT, DELETE).
- Người dùng có thể tạo dự án mới (tự động trở thành `OWNER`).
- Chỉ `OWNER` mới có quyền Chỉnh sửa hoặc Xóa dự án.
- Xem danh sách các dự án đang tham gia.

### 👥 3. Quản lý Thành viên (Member Management)
- **Mời thành viên mới** vào dự án bằng Email.
- **Xem danh sách thành viên** của dự án (yêu cầu là thành viên).
- **Trục xuất thành viên** (chỉ dành cho `OWNER` hoặc `ADMIN`).

### 📂 4. Quản lý Tài liệu & Lưu trữ (Document Storage)
- Tích hợp hệ thống lưu trữ đối tượng **MinIO** (chuẩn S3).
- **Trang quản trị MinIO:** `http://localhost:9001` (Tài khoản: `minioadmin` / `minioadmin`)
- **Cách kiểm tra file sau khi Upload:** 
  1. Đăng nhập vào trang quản trị MinIO.
  2. Chọn mục **Buckets** bên menu trái.
  3. Chọn bucket **`kbase-files`** -> Mở tab **Object Browser**. Bạn sẽ thấy file vật lý được lưu trữ ở đây.
  4. Thông tin file (tên gốc, size, người up) được lưu đồng thời trong bảng `documents` của PostgreSQL.

---

## 🚀 Hướng dẫn cài đặt (Getting Started)

### Yêu cầu hệ thống (Prerequisites)
- **Java 21** (JDK 21)
- **Maven** 3.8+
- **Docker & Docker Compose** (Để chạy PostgreSQL và MinIO)

### Các bước cài đặt (Installation)
1. **Clone dự án:**
   ```bash
   git clone https://github.com/VinhHoHuu/KBaseProject.git
   cd KBaseProject
   ```

2. **Khởi động Database và MinIO:**
   Cài đặt Docker Desktop và chạy lệnh sau để khởi động PostgreSQL & MinIO:
   ```bash
   docker-compose up -d
   ```

3. **Chạy ứng dụng Spring Boot:**
   ```bash
   mvn spring-boot:run
   ```
   *Server sẽ chạy ở địa chỉ `http://localhost:8080`*

---

## 📖 Tài liệu API (API Documentation)
Dự án được tích hợp sẵn **Swagger UI** (OpenAPI 3.0) với giao diện trực quan và tính năng test trực tiếp qua nút `Authorize`.
👉 Truy cập sau khi chạy server: **[http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)**

---

## 🛠️ Luồng tự động hóa (CI/CD)
Dự án đã được thiết lập sẵn **GitHub Actions (CI)**:
- Mỗi khi có code mới được Push hoặc Pull Request vào nhánh `main`.
- Hệ thống tự động khởi tạo Container **PostgreSQL 15**.
- Cài đặt JDK 21 và tự động chạy `mvn clean package` để Build & Run Unit Test, đảm bảo độ ổn định của hệ thống 100%.

---
*Phát triển bởi [VinhHoHuu](https://github.com/VinhHoHuu).*
