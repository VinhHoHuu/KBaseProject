'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { User } from '@/types/auth.types';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const currentUser = AuthService.getCurrentUser();
      
      if (!token || !currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border-t-4 border-red-600">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Welcome back, <span className="font-semibold text-red-600">{user?.email}</span>!
        </p>
        <div className="mt-8 flex justify-between items-center">
          <p className="text-gray-500 text-sm">
            You are successfully authenticated. Phase 6 will implement the Project and Document management features here.
          </p>
          <button
            onClick={() => {
              AuthService.logout();
              router.push('/login');
            }}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
