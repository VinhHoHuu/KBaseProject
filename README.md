<div align="center">
  <h1>🚀 KBase - Project Management API</h1>
  <p>
    A powerful, secure, and flexible Project Management API system built on <b>Spring Boot 3</b> & <b>Java 21</b>.
  </p>
  <p>
    <img src="https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=java" alt="Java 21">
    <img src="https://img.shields.io/badge/Spring_Boot-3.4.0-brightgreen?style=for-the-badge&logo=spring" alt="Spring Boot">
    <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js">
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS">
    <img src="https://img.shields.io/badge/PostgreSQL-15-blue?style=for-the-badge&logo=postgresql" alt="PostgreSQL">
    <img src="https://img.shields.io/badge/MinIO-S3_Storage-red?style=for-the-badge&logo=minio" alt="MinIO">
    <img src="https://img.shields.io/badge/Cloudinary-Cloud_Storage-3448C5?style=for-the-badge&logo=cloudinary" alt="Cloudinary">
    <img src="https://img.shields.io/badge/Security-JWT-red?style=for-the-badge&logo=springsecurity" alt="JWT Security">
    <img src="https://img.shields.io/badge/CI/CD-GitHub_Actions-black?style=for-the-badge&logo=githubactions" alt="GitHub Actions">
    <img src="https://img.shields.io/badge/Deployment-Render-purple?style=for-the-badge&logo=render" alt="Render">
  </p>
</div>

---

## 🌟 Introduction
**KBase** is a Backend API system (similar to a mini Jira/Trello) providing project management solutions for teams. The project focuses on security with a JWT authentication system, user role authorization, and performance optimization with Hibernate/JPA. 
The system is currently **Deployed Live** with an automated CI/CD pipeline via GitHub Actions and Docker.

- 🌐 **Official Frontend (Vercel):** **[https://k-base-project.vercel.app](https://k-base-project.vercel.app)**
- 🚀 **Backend API (Render):** **[https://kbaseproject.onrender.com/](https://kbaseproject.onrender.com/)**
- 🟢 **Swagger UI API Docs:** **[https://kbaseproject.onrender.com/swagger-ui/index.html](https://kbaseproject.onrender.com/swagger-ui/index.html)**

---

## ⚙️ Features & Architecture

### ⚛️ 1. Modern User Interface (Frontend Architecture)
- Developed using **Next.js 14** (App Router) combined with **TypeScript**.
- Crisp, Responsive UI design with **Tailwind CSS**.
- **Axios Interceptors:** Automatically attaches JWT authentication strings to every request, and automatically redirects to the Login page when the Token expires (401 Error).
- Clear architectural separation: `components/` (UI), `services/` (API Integration), and `types/` (Data Models).

### 🔐 2. Authentication & Security (Backend Authentication)
- Account **Registration / Login**.
- Secure password hashing with **Bcrypt**.
- Issue and verify using **JSON Web Tokens (JWT)**.
- Professional 401 Unauthorized error handling using JSON standard.

### 🗂️ 3. Project Management
- **RESTful** standard API design (GET, POST, PUT, DELETE).
- Users can create new projects (automatically becoming `OWNER`).
- Only `OWNER` has the permission to Edit or Delete projects.
- View the list of participating projects.

### 👥 4. Member Management
- **Invite new members** to the project via Email.
- **View the list of members** of a project (requires being a member).
- **Remove members** (only for `OWNER` or `ADMIN`).

### 📂 5. Document Management & Storage
- Integrated **MinIO** (Local Development) and **Cloudinary** (Production) for seamless object storage.
- **MinIO Admin Console (Local):** `http://localhost:9001` (Credentials: `minioadmin` / `minioadmin`)
- **Cloudinary:** Fully configured for Production via environment variables to ensure zero data-loss on PaaS deployments like Render.
- **How to verify files after Upload (Local):** 
  1. Log in to the MinIO admin console.
  2. Select **Buckets** from the left menu.
  3. Select the **`kbase-files`** bucket -> Open the **Object Browser** tab. You will see the physical files stored here.
  4. File information (original name, size, uploader) is simultaneously stored in the `documents` table of PostgreSQL.

---

## 🚀 Getting Started

### Prerequisites
- **Java 21** (JDK 21)
- **Maven** 3.8+
- **Docker & Docker Compose** (To run PostgreSQL and MinIO)

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/VinhHoHuu/KBaseProject.git
   cd KBaseProject
   ```

2. **Start Database and MinIO:**
   Install Docker Desktop and run the following command to start PostgreSQL & MinIO:
   ```bash
   docker-compose up -d
   ```

3. **Run the Spring Boot application:**
   ```bash
   mvn spring-boot:run
   ```
   *The server will run at `http://localhost:8080`*

---

## 📖 API Documentation
The project has built-in **Swagger UI** (OpenAPI 3.0) with an intuitive interface and direct testing capabilities via the `Authorize` button.

- 🚀 **API Homepage (Render):** **[https://kbaseproject.onrender.com/](https://kbaseproject.onrender.com/)**
- 🟢 **Swagger UI (Render):** **[https://kbaseproject.onrender.com/swagger-ui/index.html](https://kbaseproject.onrender.com/swagger-ui/index.html)**
- 💻 **Localhost:** **[http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)**

---

## 🛠️ CI/CD Pipeline
The project is set up with **GitHub Actions (CI)**:
- Triggered whenever new code is Pushed or Pull Requested to the `main` branch.
- The system automatically initializes a **PostgreSQL 15** container.
- Installs JDK 21 and automatically runs `mvn clean package` to Build & Run Unit Tests, ensuring 100% system stability.

---

## 🚀 Deployment Guide (CI/CD)

The project includes **Docker** support, making it easy to deploy on any Cloud platform that supports Containers (such as Render, AWS, DigitalOcean).

### 1. Deploy using Docker Compose (Local/VPS)
The `docker-compose.yml` environment pre-defines 3 services: `postgres`, `minio`, and `backend`. Just one command to run the entire system:
```bash
docker-compose up -d --build
```
The system will automatically build the image for Spring Boot and connect to the Database/Storage services.

### 2. Deploy Backend to Render.com (Web Service)
1. Log in to Render, choose to create a new **Web Service**.
2. Connect to your Github Repository.
3. In the configuration section, choose the **Docker** environment. Render will automatically read the `Dockerfile` in the source code to build.
4. Add the necessary Environment Variables for the Server:
   - `SPRING_DATASOURCE_URL` (DB connection URL)
   - `SPRING_DATASOURCE_USERNAME`
   - `SPRING_DATASOURCE_PASSWORD`
   - `STORAGE_TYPE` = `cloudinary` (To enable Cloudinary for production)
   - `CLOUDINARY_URL` (Your Cloudinary API URL)

### 3. Deploy Frontend to Vercel
1. Log in to **Vercel** with your GitHub account.
2. Select **Add New -> Project** and Import the `KBaseProject` repository.
3. In the project configuration, change the `Root Directory` to the `frontend` folder.
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = `https://kbaseproject.onrender.com/api` (Backend API URL)
5. Click **Deploy**. Vercel will automatically build Next.js and update whenever new code is pushed to the `main` branch.

---

## 🤖 AI-Assisted Development
This project was developed with the companionship of the **AI Programming Assistant (Antigravity AI)**. The development process applies a "Pair Programming" model between the software engineer and AI to:
- **Optimize architecture:** Build a clean code system, optimize JPA/Hibernate queries, and establish a strict JWT security authentication flow.
- **Integrate modern technologies:** Support quick setup of MinIO SDK, Docker Compose, and GitHub Actions CI/CD.
- **Troubleshooting:** Automate the debugging process, detect library conflicts, and provide comprehensive solutions.

---
*Developed by [VinhHoHuu](https://github.com/VinhHoHuu) & Antigravity AI.*
