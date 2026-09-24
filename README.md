<div align="center">
  <h1>🚀 KBase - Project Management API</h1>
  <p>
    Hệ thống API Quản lý Dự án mạnh mẽ, bảo mật và linh hoạt được xây dựng trên nền tảng <b>Spring Boot 3</b> & <b>Java 21</b>.
  </p>
  <p>
    <img src="https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=java" alt="Java 21">
    <img src="https://img.shields.io/badge/Spring_Boot-3.4.0-brightgreen?style=for-the-badge&logo=spring" alt="Spring Boot">
    <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js">
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS">
    <img src="https://img.shields.io/badge/PostgreSQL-15-blue?style=for-the-badge&logo=postgresql" alt="PostgreSQL">
    <img src="https://img.shields.io/badge/MinIO-S3_Storage-red?style=for-the-badge&logo=minio" alt="MinIO">
    <img src="https://img.shields.io/badge/Security-JWT-red?style=for-the-badge&logo=springsecurity" alt="JWT Security">
    <img src="https://img.shields.io/badge/CI/CD-GitHub_Actions-black?style=for-the-badge&logo=githubactions" alt="GitHub Actions">
    <img src="https://img.shields.io/badge/Deployment-Render-purple?style=for-the-badge&logo=render" alt="Render">
  </p>
</div>

---

## 🌟 Giới thiệu (Introduction)
**KBase** là một hệ thống Backend API (tương tự Jira/Trello thu nhỏ) cung cấp các giải pháp quản lý dự án dành cho nhóm làm việc. Dự án tập trung vào tính năng bảo mật với hệ thống xác thực JWT, phân quyền thao tác người dùng, và tối ưu hóa hiệu suất với Hibernate/JPA. 
Hệ thống hiện đang được **Deploy Live** với luồng CI/CD tự động thông qua GitHub Actions và Docker.

- 🌐 **Giao diện chính thức (Vercel):** **[https://k-base-project.vercel.app](https://k-base-project.vercel.app)**
- 🚀 **Backend API (Render):** **[https://kbaseproject.onrender.com/](https://kbaseproject.onrender.com/)**
- 🟢 **Swagger UI API Docs:** **[https://kbaseproject.onrender.com/swagger-ui/index.html](https://kbaseproject.onrender.com/swagger-ui/index.html)**

---

## ⚙️ Tính năng & Kiến trúc nổi bật (Features & Architecture)

### ⚛️ 1. Giao diện Người dùng Hiện đại (Frontend Architecture)
- Phát triển bằng **Next.js 14** (App Router) kết hợp **TypeScript**.
- Thiết kế UI sắc nét, Responsive với **Tailwind CSS**.
- **Axios Interceptors:** Xử lý tự động đính kèm chuỗi xác thực JWT vào mọi request, và tự động điều hướng (Redirect) về trang Đăng nhập khi Token hết hạn (Lỗi 401).
- Kiến trúc phân chia rõ ràng: `components/` (Giao diện), `services/` (Tích hợp API) và `types/` (Định dạng dữ liệu).

### 🔐 2. Quản lý Xác thực & Bảo mật (Backend Authentication)
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

### ⚠️ 5. Vấn đề Đã biết (Known Issues)
- **Upload file trên môi trường Production (Render/Vercel):** Hiện tại đang bị lỗi không upload được tài liệu. (Lưu ý: Trước khi tích hợp AI thì tính năng upload trên Vercel vẫn hoạt động bình thường).
- **Môi trường Localhost:** Tính năng Upload file hoạt động trơn tru (kết nối với Local MinIO) và đã tích hợp thành công AI Chat.

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

- 🚀 **Trang chủ API (Render):** **[https://kbaseproject.onrender.com/](https://kbaseproject.onrender.com/)**
- 🟢 **Swagger UI (Render):** **[https://kbaseproject.onrender.com/swagger-ui/index.html](https://kbaseproject.onrender.com/swagger-ui/index.html)**
- 💻 **Localhost:** **[http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)**

---

## 🛠️ Luồng tự động hóa (CI/CD)
Dự án đã được thiết lập sẵn **GitHub Actions (CI)**:
- Mỗi khi có code mới được Push hoặc Pull Request vào nhánh `main`.
- Hệ thống tự động khởi tạo Container **PostgreSQL 15**.
- Cài đặt JDK 21 và tự động chạy `mvn clean package` để Build & Run Unit Test, đảm bảo độ ổn định của hệ thống 100%.

---

## 🚀 Hướng dẫn Deployment (CI/CD)

Dự án hỗ trợ sẵn **Docker** giúp bạn dễ dàng deploy lên bất kỳ nền tảng Cloud nào hỗ trợ Container (như Render, AWS, DigitalOcean).

### 1. Triển khai bằng Docker Compose (Local/VPS)
Môi trường `docker-compose.yml` đã định nghĩa sẵn 3 dịch vụ: `postgres`, `minio` và `backend`. Chỉ cần một câu lệnh để chạy toàn bộ hệ thống:
```bash
docker-compose up -d --build
```
Hệ thống sẽ tự động build image cho Spring Boot và kết nối với các service Database/Storage.

### 2. Triển khai Backend lên Render.com (Web Service)
1. Đăng nhập vào Render, chọn tạo mới **Web Service**.
2. Kết nối với Repository Github của bạn.
3. Trong phần cấu hình, chọn môi trường **Docker**. Render sẽ tự động đọc `Dockerfile` trong source code để build.
4. Thêm các biến môi trường (Environment Variables) cần thiết cho Server:
   - `SPRING_DATASOURCE_URL` (URL kết nối DB)
   - `SPRING_DATASOURCE_USERNAME`
   - `SPRING_DATASOURCE_PASSWORD`
   - `MINIO_URL` (URL tới MinIO server của bạn)
   - `MINIO_ACCESS_KEY` & `MINIO_SECRET_KEY`

### 3. Triển khai Frontend lên Vercel
1. Đăng nhập vào **Vercel** bằng tài khoản GitHub.
2. Chọn **Add New -> Project** và Import repository `KBaseProject`.
3. Trong cấu hình dự án, đổi `Root Directory` thành thư mục `frontend`.
4. Thêm biến môi trường:
   - `NEXT_PUBLIC_API_URL` = `https://kbaseproject.onrender.com/api` (URL của Backend API)
5. Bấm **Deploy**. Vercel sẽ tự động build Next.js và cập nhật mỗi khi có code mới đẩy lên nhánh `main`.

---

## 🤖 Hỗ trợ bởi Trí tuệ Nhân tạo (AI-Assisted Development)
Dự án này được phát triển với sự đồng hành của **Trợ lý lập trình AI (Antigravity AI)**. Quá trình phát triển áp dụng mô hình "Pair Programming" giữa kỹ sư phần mềm và AI nhằm:
- **Tối ưu hóa kiến trúc:** Xây dựng hệ thống clean code, tối ưu hóa các câu truy vấn JPA/Hibernate và thiết lập luồng xác thực bảo mật JWT chặt chẽ.
- **Tích hợp công nghệ hiện đại:** Hỗ trợ cài đặt nhanh chóng MinIO SDK, Docker Compose và GitHub Actions CI/CD.
- **Xử lý sự cố (Troubleshooting):** Tự động hóa quá trình debug, phát hiện lỗi xung đột thư viện và đưa ra giải pháp khắc phục triệt để.

---
*Phát triển bởi [VinhHoHuu](https://github.com/VinhHoHuu) & Antigravity AI.*
