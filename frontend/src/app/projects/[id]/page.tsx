'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProjectService } from '@/services/project.service';
import { MemberService } from '@/services/member.service';
import { DocumentService } from '@/services/document.service';
import { AuthService } from '@/services/auth.service';
import { Project, ProjectMember, ProjectStatus } from '@/types/project.types';
import { Document } from '@/types/document.types';
import { User } from '@/types/auth.types';
import { use } from 'react';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<ProjectStatus, string> = {
  PLANNED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200'
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNED: 'Planned',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed'
};

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
  const [editProjectStartDate, setEditProjectStartDate] = useState('');
  const [editProjectEndDate, setEditProjectEndDate] = useState('');
  const [editProjectStatus, setEditProjectStatus] = useState<ProjectStatus>('PLANNED');
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
      setEditProjectStartDate(projData.startDate ? projData.startDate.split('T')[0] : '');
      setEditProjectEndDate(projData.endDate ? projData.endDate.split('T')[0] : '');
      setEditProjectStatus(projData.status || 'PLANNED');
      setMembers(membersData);
      setDocuments(docsData);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
      } else {
        toast.error('Could not load project data. Please try again.');
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
      toast.success('Member added successfully!');
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error adding member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm('Are you sure you want to remove this member from the project?')) return;
    try {
      await MemberService.removeMember(projectId, memberId);
      toast.success('Member removed!');
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error removing member');
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProjectName.trim()) {
      toast.error('Project name cannot be empty!');
      return;
    }
    
    // Validations
    if (editProjectStartDate) {
      const start = new Date(editProjectStartDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (start < today) {
        toast.error('Start date cannot be in the past!');
        return;
      }
      
      if (editProjectEndDate) {
        const end = new Date(editProjectEndDate);
        if (start > end) {
          toast.error('Start date cannot be after end date!');
          return;
        }
      }
    }
    
    setIsSavingProject(true);
    try {
      await ProjectService.updateProject(projectId, {
        name: editProjectName,
        description: editProjectDesc,
        startDate: editProjectStartDate ? `${editProjectStartDate}T00:00:00` : undefined,
        endDate: editProjectEndDate ? `${editProjectEndDate}T23:59:59` : undefined,
        status: editProjectStatus
      });
      toast.success('Project updated successfully!');
      setIsEditingProject(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'An error occurred while updating the project');
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('WARNING: This action will delete ALL data of the project. Are you sure you want to delete it?')) return;
    try {
      await ProjectService.deleteProject(projectId);
      toast.success('Project deleted!');
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error deleting project');
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
      toast.error('File too large. Please select a file under 100MB.');
      return;
    }
    
    setIsUploading(true);
    try {
      await DocumentService.uploadDocument(projectId, file);
      toast.success('Document uploaded successfully!');
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'An error occurred while uploading the document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await DocumentService.deleteDocument(projectId, docId);
      toast.success('Document deleted!');
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error deleting document');
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
        <p className="text-gray-500">Project does not exist or you do not have permission to view it.</p>
        <Link href="/" className="text-red-600 hover:underline mt-4 inline-block">
          Back to Dashboard
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
          ← Back to Dashboard
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
                placeholder="Project Name"
                required
              />
              <textarea
                value={editProjectDesc}
                onChange={(e) => setEditProjectDesc(e.target.value)}
                className="w-full text-gray-600 dark:text-gray-300 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-red-500 focus:border-red-500 bg-transparent resize-none mb-3"
                placeholder="Project Description"
                rows={2}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
                  <select
                    value={editProjectStatus}
                    onChange={(e) => setEditProjectStatus(e.target.value as ProjectStatus)}
                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-red-500 focus:border-red-500 bg-transparent text-sm dark:text-white"
                  >
                    <option value="PLANNED">Planned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editProjectStartDate}
                    onChange={(e) => setEditProjectStartDate(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-red-500 focus:border-red-500 bg-transparent text-sm dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={editProjectEndDate}
                    onChange={(e) => setEditProjectEndDate(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-red-500 focus:border-red-500 bg-transparent text-sm dark:text-white"
                  />
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProject(false)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProject}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors disabled:opacity-50"
                >
                  {isSavingProject ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {project.name}
                </h1>
                {project.status && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${STATUS_COLORS[project.status]}`}>
                    {STATUS_LABELS[project.status]}
                  </span>
                )}
                {isOwner && (
                  <button 
                    onClick={() => setIsEditingProject(true)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Edit Project"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                {project.description}
              </p>
              {(project.startDate || project.endDate) && (
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <span className="font-medium">Schedule:</span> {project.startDate ? new Date(project.startDate).toLocaleDateString('en-US') : '?'} - {project.endDate ? new Date(project.endDate).toLocaleDateString('en-US') : '?'}
                </div>
              )}
            </div>
          )}
          
          <div className="flex flex-col items-end gap-3 ml-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
              project.myRole === 'OWNER'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300'
            }`}>
              Your Role: {project.myRole}
            </span>
            
            {isOwner && (
              <button
                onClick={handleDeleteProject}
                className="text-xs text-red-600 hover:text-white border border-red-600 hover:bg-red-600 px-3 py-1 rounded transition-colors whitespace-nowrap flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete Project
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Documents */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Project Documents ({documents.length})
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
                  Drag and drop files here or <label className="text-red-600 hover:text-red-700 cursor-pointer font-medium">
                    browse
                    <input type="file" className="hidden" onChange={handleFileSelect} disabled={isUploading} />
                  </label>
                </p>
                <p className="text-xs text-gray-500">Supports all formats (Max 100MB)</p>
                {isUploading && (
                  <div className="mt-3 text-sm text-red-600 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                    Uploading...
                  </div>
                )}
              </div>
            </div>

            {/* Document List */}
            {documents.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No documents found in this project.
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
                            <span>Uploaded by: {doc.uploadedByUsername}</span>
                            <span>•</span>
                            <span>{new Date(doc.uploadedAt).toLocaleDateString('en-US')}</span>
                          </div>
                        </div>
                      </div>
                      
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          title="Delete document"
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
                Members ({members.length})
              </h2>
              {isOwner && (
                <button
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  + Add
                </button>
              )}
            </div>

            {showAddMember && isOwner && (
              <form onSubmit={handleAddMember} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Member Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm bg-transparent dark:text-white"
                    placeholder="e.g. user@gmail.com"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    Invite
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
                        title="Remove member"
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
