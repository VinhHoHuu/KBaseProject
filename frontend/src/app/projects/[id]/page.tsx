'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProjectService } from '@/services/project.service';
import { MemberService } from '@/services/member.service';
import { DocumentService } from '@/services/document.service';
import { AuthService } from '@/services/auth.service';
import { Project, ProjectMember } from '@/types/project.types';
import { Document } from '@/types/document.types';
import { User } from '@/types/auth.types';
import { use } from 'react';
import toast from 'react-hot-toast';

export default function ProjectDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const projectId = parseInt(resolvedParams.id, 10);
  
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Document states
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Add Member states
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Edit Project states
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectDesc, setEditProjectDesc] = useState('');
  const [isSavingProject, setIsSavingProject] = useState(false);

  const loadData = async () => {
    try {
      const currentUser = AuthService.getCurrentUser();
      setUser(currentUser);

      const [projData, membersData, docsData] = await Promise.all([
        ProjectService.getProjectById(projectId),
        MemberService.getMembers(projectId),
        DocumentService.getDocuments(projectId)
      ]);
      setProject(projData);
      setEditProjectName(projData.name);
      setEditProjectDesc(projData.description || '');
      setMembers(membersData);
      setDocuments(docsData);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
      } else {
        toast.error('Không thể tải dữ liệu dự án. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId, router]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    
    try {
      await MemberService.addMember(projectId, newMemberEmail);
      setNewMemberEmail('');
      setShowAddMember(false);
      toast.success('Đã thêm thành viên thành công!');
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi thêm thành viên');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thành viên này khỏi dự án?')) return;
    try {
      await MemberService.removeMember(projectId, memberId);
      toast.success('Đã xóa thành viên!');
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi xóa thành viên');
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProjectName.trim()) {
      toast.error('Tên dự án không được để trống!');
      return;
    }
    
    setIsSavingProject(true);
    try {
      await ProjectService.updateProject(projectId, {
        name: editProjectName,
        description: editProjectDesc
      });
      toast.success('Cập nhật dự án thành công!');
      setIsEditingProject(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật dự án');
    } finally {
      setIsSavingProject(false);
    }
  };

  // --- Document Handlers ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await uploadFile(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    // Limit to 100MB as per backend description
    if (file.size > 100 * 1024 * 1024) {
      toast.error('File quá lớn. Vui lòng chọn file dưới 100MB.');
      return;
    }
    
    setIsUploading(true);
    try {
      await DocumentService.uploadDocument(projectId, file);
      toast.success('Tải tài liệu lên thành công!');
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tải tài liệu lên');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;
    try {
      await DocumentService.deleteDocument(projectId, docId);
      toast.success('Đã xóa tài liệu!');
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi xóa tài liệu');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Dự án không tồn tại hoặc bạn không có quyền truy cập.</p>
        <Link href="/" className="text-red-600 hover:underline mt-4 inline-block">
          Quay lại Dashboard
        </Link>
      </div>
    );
  }

  const isOwner = project.myRole === 'OWNER';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1">
          ← Quay lại Dashboard
        </Link>
      </div>

      {/* Project Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8 border-t-4 border-red-600">
        <div className="flex justify-between items-start">
          {isEditingProject ? (
            <form onSubmit={handleUpdateProject} className="flex-1 mr-4">
              <input
                type="text"
                value={editProjectName}
                onChange={(e) => setEditProjectName(e.target.value)}
                className="w-full text-2xl font-bold mb-2 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-red-500 focus:border-red-500 bg-transparent dark:text-white"
                placeholder="Tên dự án"
                required
              />
              <textarea
                value={editProjectDesc}
                onChange={(e) => setEditProjectDesc(e.target.value)}
                className="w-full text-gray-600 dark:text-gray-300 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-red-500 focus:border-red-500 bg-transparent resize-none"
                placeholder="Mô tả dự án"
                rows={2}
              />
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProject(false)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingProject}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors disabled:opacity-50"
                >
                  {isSavingProject ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {project.name}
                </h1>
                {isOwner && (
                  <button 
                    onClick={() => setIsEditingProject(true)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Chỉnh sửa dự án"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                {project.description}
              </p>
            </div>
          )}
          <span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ml-4 ${
            project.myRole === 'OWNER'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300'
          }`}>
            Vai trò của bạn: {project.myRole}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Documents */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Tài liệu dự án ({documents.length})
              </h2>
            </div>
            
            {/* Upload Area */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`mb-6 p-8 border-2 border-dashed rounded-xl text-center transition-colors ${
                isDragging 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500 hover:bg-gray-50 dark:hover:bg-gray-700/30'
              }`}
            >
              <div className="flex flex-col items-center justify-center">
                <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Kéo thả file vào đây hoặc <label className="text-red-600 hover:text-red-700 cursor-pointer font-medium">
                    chọn file
                    <input type="file" className="hidden" onChange={handleFileSelect} disabled={isUploading} />
                  </label>
                </p>
                <p className="text-xs text-gray-500">Hỗ trợ mọi định dạng (Tối đa 100MB)</p>
                {isUploading && (
                  <div className="mt-3 text-sm text-red-600 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                    Đang tải lên...
                  </div>
                )}
              </div>
            </div>

            {/* Document List */}
            {documents.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Chưa có tài liệu nào trong dự án.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {documents.map((doc) => {
                  const canDelete = isOwner || doc.uploadedByUsername === user?.email;
                  const fileSize = doc.size < 1024 * 1024 
                    ? (doc.size / 1024).toFixed(1) + ' KB' 
                    : (doc.size / (1024 * 1024)).toFixed(1) + ' MB';

                  return (
                    <li key={doc.id} className="py-4 flex justify-between items-center group">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <svg className="w-8 h-8 text-gray-400 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <a 
                            href={doc.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm font-medium text-gray-900 dark:text-white hover:text-red-600 transition-colors"
                          >
                            {doc.name}
                          </a>
                          <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span>{fileSize}</span>
                            <span>•</span>
                            <span>Người đăng: {doc.uploadedByUsername}</span>
                            <span>•</span>
                            <span>{new Date(doc.uploadedAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>
                      
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          title="Xóa tài liệu"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Right Column: Members */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Thành viên ({members.length})
              </h2>
              {isOwner && (
                <button
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  + Thêm
                </button>
              )}
            </div>

            {showAddMember && isOwner && (
              <form onSubmit={handleAddMember} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email thành viên mới
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm bg-transparent dark:text-white"
                    placeholder="VD: user@gmail.com"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    Mời
                  </button>
                </div>
              </form>
            )}

            <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
              {members.map((member) => (
                <li key={member.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {member.fullName || member.email}
                    </p>
                    {member.fullName && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {member.email}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      member.role === 'OWNER' 
                        ? 'bg-red-600 text-white shadow-sm' 
                        : 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300'
                    }`}>
                      {member.role}
                    </span>
                    {isOwner && member.role !== 'OWNER' && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Xóa thành viên"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
