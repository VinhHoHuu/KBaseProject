'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService } from '@/services/auth.service';
import { ProjectService } from '@/services/project.service';
import { User } from '@/types/auth.types';
import { Project } from '@/types/project.types';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchProjects = async () => {
    try {
      const data = await ProjectService.getAllProjects();
      setProjects(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        AuthService.logout();
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const currentUser = AuthService.getCurrentUser();
      
      if (!token || !currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
        fetchProjects();
      }
    };
    checkAuth();
  }, [router]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    
    try {
      await ProjectService.createProject({
        name: newProjectName,
        description: newProjectDesc
      });
      setShowModal(false);
      setNewProjectName('');
      setNewProjectDesc('');
      fetchProjects(); // refresh list
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi tạo dự án');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Xin chào, <span className="text-red-600">{user?.fullName || user?.email}</span>!
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Đây là danh sách các dự án bạn đang tham gia.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          + Tạo dự án mới
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Bạn chưa tham gia dự án nào.</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Tạo dự án đầu tiên của bạn
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700 h-full flex flex-col overflow-hidden group cursor-pointer">
                <div className="p-5 flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-red-600 transition-colors">
                      {project.name}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      project.myRole === 'OWNER' 
                        ? 'bg-red-600 text-white shadow-sm' 
                        : 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300'
                    }`}>
                      {project.myRole}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                    {project.description}
                  </p>
                </div>
                <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                  Tạo ngày: {new Date(project.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowModal(false)} />

            <div className="relative inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                Tạo Dự án Mới
              </h3>
              
              {errorMsg && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-md text-sm">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleCreateProject}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tên dự án *
                    </label>
                    <input
                      type="text"
                      required
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm bg-transparent dark:text-white"
                      placeholder="Nhập tên dự án..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mô tả dự án
                    </label>
                    <textarea
                      rows={3}
                      value={newProjectDesc}
                      onChange={(e) => setNewProjectDesc(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm bg-transparent dark:text-white resize-none"
                      placeholder="Viết một vài dòng mô tả về dự án này..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Đang tạo...' : 'Tạo Dự án'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
