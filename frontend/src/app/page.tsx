'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Link from 'next/link';
import { AuthService } from '@/services/auth.service';
import { ProjectService } from '@/services/project.service';
import { User } from '@/types/auth.types';
import { Project, ProjectStatus } from '@/types/project.types';
import toast from 'react-hot-toast';

const STATUS_STYLES: Record<ProjectStatus, string> = {
  PLANNED: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-500/20',
  IN_PROGRESS: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-100 dark:border-amber-500/20',
  COMPLETED: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20'
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNED: 'Planned',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed'
};

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dashboard Controls
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ProjectStatus>('ALL');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'OWNER' | 'MEMBER'>('ALL');

  // Filter projects based on status and role
  const filteredProjects = useMemo(() => {
    let result = projects;
    if (statusFilter !== 'ALL') {
      result = result.filter(p => p.status === statusFilter);
    }
    if (roleFilter !== 'ALL') {
      result = result.filter(p => p.myRole === roleFilter);
    }
    return result;
  }, [projects, statusFilter, roleFilter]);

  // Deterministic color generator for projects based on ID
  const getProjectColor = (id: number) => {
    const PROJECT_COLORS = [
      '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', 
      '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'
    ];
    return PROJECT_COLORS[id % PROJECT_COLORS.length];
  };

  const calendarEvents = useMemo(() => {
    return projects
      .filter(p => p.status !== 'COMPLETED' && (p.startDate || p.endDate))
      .map(p => {
        const pColor = getProjectColor(p.id);
        return {
          id: p.id.toString(),
          title: p.name,
          start: p.startDate,
          end: p.endDate,
          allDay: true, 
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          extendedProps: { ...p, color: pColor }
        };
      });
  }, [projects]);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectStartDate, setNewProjectStartDate] = useState('');
  const [newProjectEndDate, setNewProjectEndDate] = useState('');
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
    
    if (newProjectStartDate) {
      const start = new Date(newProjectStartDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (start < today) {
        toast.error('Start date cannot be in the past!');
        setErrorMsg('Start date cannot be in the past!');
        return;
      }
      
      if (newProjectEndDate) {
        const end = new Date(newProjectEndDate);
        if (start > end) {
          toast.error('Start date cannot be after end date!');
          setErrorMsg('Start date cannot be after end date!');
          return;
        }
      }
    }

    setIsSubmitting(true);
    
    try {
      await ProjectService.createProject({
        name: newProjectName,
        description: newProjectDesc,
        startDate: newProjectStartDate ? `${newProjectStartDate}T00:00:00` : undefined,
        endDate: newProjectEndDate ? `${newProjectEndDate}T23:59:59` : undefined
      });
      setShowModal(false);
      setNewProjectName('');
      setNewProjectDesc('');
      setNewProjectStartDate('');
      setNewProjectEndDate('');
      toast.success('Project created successfully!');
      fetchProjects();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'An error occurred while creating the project');
      setErrorMsg(err.response?.data?.message || 'An error occurred while creating the project');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-gray-900/50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-800"></div>
          <div className="absolute top-0 left-0 animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-white relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-500/10 rounded-full blur-3xl opacity-50 dark:opacity-20 animate-pulse-slow"></div>
        <div className="absolute top-20 right-20 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl opacity-50 dark:opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              Welcome, <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-rose-500">{user?.fullName || user?.email}</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg font-medium">
              Here's what's happening with your projects today.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="group relative inline-flex items-center justify-center px-6 py-3 font-semibold text-white transition-all duration-300 ease-in-out transform hover:scale-105 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 overflow-hidden"
          >
            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
            <span className="relative flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Create Project
            </span>
          </button>
        </div>

        {/* Controls: Filter & View Toggle */}
        {(projects.length > 0 || statusFilter !== 'ALL' || roleFilter !== 'ALL') && (
          <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 rounded-2xl p-4 shadow-sm mb-8 flex flex-col lg:flex-row justify-between items-center gap-6">
            
            <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto">
              {/* Role Filter */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider shrink-0">Role</span>
                <div className="flex bg-gray-100/80 dark:bg-gray-900/50 p-1 rounded-xl">
                  {['ALL', 'OWNER', 'MEMBER'].map((role) => (
                    <button
                      key={role}
                      onClick={() => setRoleFilter(role as any)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                        roleFilter === role 
                          ? 'bg-white dark:bg-gray-800 shadow-sm text-red-600 dark:text-red-400' 
                          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      {role === 'ALL' ? 'All Roles' : role === 'OWNER' ? 'Owner' : 'Member'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="hidden sm:block w-px h-10 bg-gray-200 dark:bg-gray-700"></div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar w-full">
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:block">Status</span>
                <div className="flex bg-gray-100/80 dark:bg-gray-900/50 p-1 rounded-xl w-max">
                  <button
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      statusFilter === 'ALL' 
                        ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white' 
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    All Status
                  </button>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setStatusFilter(key as ProjectStatus)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 whitespace-nowrap ${
                        statusFilter === key 
                          ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white' 
                          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100/80 dark:bg-gray-900/50 p-1 rounded-xl shrink-0 self-end lg:self-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-2 ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-800 shadow-sm text-red-600 dark:text-red-400' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                Grid
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-2 ${
                  viewMode === 'calendar' 
                    ? 'bg-white dark:bg-gray-800 shadow-sm text-red-600 dark:text-red-400' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Calendar
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        {projects.length === 0 ? (
          <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl shadow-2xl p-16 text-center border border-white/50 dark:border-gray-700/50 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none"></div>
            <div className="w-24 h-24 mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No projects yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm text-lg">Get started by creating your very first project and collaborate with your team.</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-8 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Create Project
            </button>
          </div>
        ) : viewMode === 'calendar' ? (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl p-6 rounded-3xl shadow-xl border border-white/50 dark:border-gray-700/50 calendar-container relative overflow-hidden">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek'
              }}
              events={calendarEvents}
              eventContent={(eventInfo) => {
                const color = eventInfo.event.extendedProps.color || '#3b82f6';
                const p = eventInfo.event.extendedProps;
                const dateText = (p.startDate || p.endDate) ? 
                  `(${p.startDate ? new Date(p.startDate).toLocaleDateString('en-US') : '?'} - ${p.endDate ? new Date(p.endDate).toLocaleDateString('en-US') : '?'})` : '';

                return (
                  <div className="flex items-center gap-1.5 px-2 py-1 w-full overflow-hidden text-xs font-semibold rounded-md border-l-4 shadow-sm hover:shadow-md transition-shadow" 
                    style={{ 
                      backgroundColor: `${color}20`, 
                      borderColor: color,
                      color: 'var(--foreground, #1f2937)'
                    }}>
                    <div className="truncate flex items-center gap-1">
                      <span>{eventInfo.event.title}</span>
                    </div>
                  </div>
                );
              }}
              eventClick={(info) => {
                router.push(`/projects/${info.event.id}`);
              }}
              height="auto"
            />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl shadow-xl p-16 text-center border border-white/50 dark:border-gray-700/50">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No matches found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">No projects match the selected status or role filters.</p>
            <button
              onClick={() => { setStatusFilter('ALL'); setRoleFilter('ALL'); }}
              className="text-red-600 hover:text-red-700 font-semibold underline decoration-2 underline-offset-4"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 dark:border-gray-700/50 h-full flex flex-col group cursor-pointer relative overflow-hidden transform hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                  
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-2 flex-wrap flex-col items-start">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${STATUS_STYLES[project.status || 'PLANNED']}`}>
                          {STATUS_LABELS[project.status || 'PLANNED']}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase ${
                          project.myRole === 'OWNER' 
                            ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md shadow-red-500/20' 
                            : 'bg-gray-200/80 text-gray-700 dark:bg-gray-700/80 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                        }`}>
                          {project.myRole}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors mb-2 line-clamp-1">
                      {project.name}
                    </h3>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 flex-grow leading-relaxed">
                      {project.description || <span className="italic opacity-50">No description provided.</span>}
                    </p>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900/50 px-2.5 py-1.5 rounded-md w-full border border-gray-100 dark:border-gray-800">
                        <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span className="font-medium truncate">{project.startDate ? new Date(project.startDate).toLocaleDateString('vi-VN') : 'TBD'}</span>
                        <span className="mx-0.5 text-gray-300 shrink-0">-</span>
                        <span className="font-medium truncate">{project.endDate ? new Date(project.endDate).toLocaleDateString('vi-VN') : 'TBD'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />

            <div className="relative inline-block w-full max-w-md p-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-2xl rounded-3xl border border-white/20 dark:border-gray-700/50">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-rose-500"></div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Create New Project
              </h3>
              
              {errorMsg && (
                <div className="mb-6 bg-red-50/80 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded-r-md text-sm font-medium">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleCreateProject}>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Project Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 bg-gray-50 dark:bg-gray-900/50 dark:text-white transition-all shadow-inner"
                      placeholder="e.g. Website Redesign"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={newProjectDesc}
                      onChange={(e) => setNewProjectDesc(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 bg-gray-50 dark:bg-gray-900/50 dark:text-white transition-all shadow-inner resize-none"
                      placeholder="What is this project about?"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={newProjectStartDate}
                        onChange={(e) => setNewProjectStartDate(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 bg-gray-50 dark:bg-gray-900/50 dark:text-white transition-all shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={newProjectEndDate}
                        onChange={(e) => setNewProjectEndDate(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 bg-gray-50 dark:bg-gray-900/50 dark:text-white transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-500 rounded-xl hover:shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Project'}
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
