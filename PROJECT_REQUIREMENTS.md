# KBase - Knowledge Base

## 🎯 What We're Building

A project knowledge base system where teams can store and manage project information. Team members can upload project documents (guides, specs, meeting notes), videos (recordings, tutorials), and other files.

Optionally, add an AI chatbot to help quickly find information by answering questions about stored content.

### What You'll Learn:
- **Backend:** Build REST APIs with Java Spring Boot (authentication, file upload, API docs with Swagger)
- **Frontend:** Create web pages with React or Next.js (upload files, dashboards, search)
- **Storage:** Use PostgreSQL for data, MinIO or S3 for files
- **Deployment:** Deploy with Docker, AWS, or other platforms
- **Optional Features:** AI chatbot (Python), Terraform/Terragrunt, Kubernetes

---

## 📝 Main Features

### 1. User Accounts
- Sign up and log in with email
- Three user types:
  - **Admin**: Manages all users and projects
  - **Owner**: Creates projects, invites team members
  - **User**: Uploads documents, asks chatbot questions

### 2. Projects
- Owners create projects
- Invite team members to join
- Each user can join multiple projects

### 3. Document Storage
- Upload files: PDF, Word (DOCX, DOC), Excel (XLSX, XLS), PowerPoint (PPTX, PPT), Markdown, TXT
- Upload images: JPG, PNG, GIF, SVG, BMP
- Upload videos: MP4, MOV, AVI
- Organize documents by project
- View and download files

### 4. AI Chatbot (Optional)
- Ask questions about uploaded documents
- Get answers with references to source files
- Works across all documents in a project

---

## 🏗️ Technical Parts

### ⚙️ Backend - Java Spring Boot
**Tools:** Spring Boot, Spring Data JPA, Spring Web MVC, Spring Security, PostgreSQL, Swagger/OpenAPI
- REST API endpoints for all features
- User authentication and authorization (JWT tokens)
- User management (create, update, delete accounts)
- Project management (create projects, add members)
- File upload handling (save files, store metadata)
- API documentation with Swagger UI
- Optional: Connect to AI chatbot

### 💾 Storage - PostgreSQL & MinIO
**Tools:** PostgreSQL, MinIO (or S3)
- PostgreSQL: Store user accounts, projects, file metadata
- MinIO (or S3): Store uploaded files and videos
- Database design (users, projects, documents, permissions)
- File storage integration (upload, download, organize)

### 📱 Frontend - React.js or Next.js (Optional)
**Tools:** React/Next.js, TypeScript, Tailwind CSS
- Login and signup pages
- Project dashboard (create, view, manage projects)
- File upload page (drag and drop files)
- Document browser and search
- Chat interface to talk with AI (if using optional AI feature)

### 🤖 AI Part - Python (Optional)
**Tools:** Python, LangChain, OpenAI or Hugging Face
- Read text from PDF and documents
- Convert videos to text (speech-to-text)
- Store document content in a searchable format
- Answer questions by finding relevant information
- Generate smart responses

### ☁️ Deployment - Docker / AWS / Other
**Tools:** Docker, AWS (or other cloud platforms), Terraform (optional), Kubernetes (optional)
- Package apps in Docker containers
- Deploy to cloud (AWS, Azure, GCP, or local server)
- Set up PostgreSQL database (RDS, managed, or self-hosted)
- Set up file storage (MinIO, S3, or local storage)

---

## 📅 Roadmap & Execution Plan (6 Phases / 6 Days)

### Day 1: Foundation & Security (Phase 1)
**Focus:** Infrastructure setup, Database Design, and Authentication.
- **Tasks:**
  - [x] Verify and finalize Docker setup for PostgreSQL and MinIO (Completed).
  - [x] Setup Spring Boot project structure (Packages: `config`, `controller`, `service`, `repository`, `entity`, `security`, `dto`).
  - [x] Database schema design for Users and Roles (User Entity).
  - [x] Implement Spring Security with JWT (JSON Web Tokens).
  - [x] Build Auth APIs: `/api/auth/register`, `/api/auth/login`.
  - [x] Configure Swagger/OpenAPI for API documentation testing.

### Day 2: Core Domain - Projects & Members (Phase 2)
**Focus:** Project management and Role-based access control.
- **Tasks:**
  - [x] Database schema design for Projects and Project Members (Many-to-Many relationship).
  - [x] Define user roles logic (Admin vs Owner vs User in a project).
  - [x] Build Project APIs: Create, Update, Delete, Get All Projects.
  - [x] Build Project Member APIs: Invite user to project, remove user, list members.
  - [x] Write basic unit tests and verify APIs via Swagger.

### Day 3: Document Storage & MinIO Integration (Phase 3)
**Focus:** Object storage integration and file management.
- **Tasks:**
  - [x] Setup AWS S3 SDK / MinIO Client in Spring Boot.
  - [x] Database schema design for Documents (storing file metadata: name, type, size, url, project_id, uploaded_by).
  - [x] Build File Upload API: Handle multipart form data, stream to MinIO, save metadata to PostgreSQL.
  - [x] Build File Download/View APIs: Generate presigned URLs from MinIO or stream through backend.
  - [x] Add file type validation (Documents, Images, Videos).

### Day 4: API Deployment & Dockerization (Phase 4)
**Focus:** Wrapping up Backend, Dockerization, and Cloud Deployment.
- **Tasks:**
  - [x] Write Dockerfile for the Spring Boot application (Multi-stage build).
  - [x] Update docker-compose.yml to include the backend service.
  - [x] Setup deployment configurations for Render.com.
  - [x] Final end-to-end testing of the complete flow.
  - [x] Refine API documentation and README.

### Day 5: Frontend Foundation & Authentication (Phase 5)
**Focus:** React/Next.js setup, UI Components, and Auth flow.
- **Tasks:**
  - Initialize Frontend project (Next.js/React) with TypeScript & Tailwind CSS.
  - Setup routing and core layout (Navbar, Sidebar).
  - Implement Login and Register pages.
  - Connect with Backend API to handle JWT Authentication (store token).
  - Create protected routes for logged-in users.

### Day 6: Frontend Integration & File Management (Phase 6)
**Focus:** Project Dashboard and Document handling.
- **Tasks:**
  - Build Project Dashboard (List, Create, and Manage projects).
  - Build Member Management UI (Invite/Remove members).
  - Build Document Upload UI (Drag & Drop zone, progress bar).
  - Integrate with Backend for file download and viewing.
  - Final end-to-end testing of the complete User flow.
