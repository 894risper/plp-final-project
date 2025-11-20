"use client"
import React from 'react';
import { useSession, signOut } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { PenSquare, LogOut, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { AnomalyDashboard } from '../../components/AnomalyDashboard'; // Adjust path if necessary

const JournalistDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated or not journalist (basic check, more robust RBAC would be middleware)
  React.useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any)?.role !== 'journalist' && (session.user as any)?.role !== 'admin') { // Admin can also access journalist dashboard for overview
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading' || !session || ((session.user as any)?.role !== 'journalist' && (session.user as any)?.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Journalist Dashboard...</p>
        </div>
      </div>
    );
  }

  const user = session.user as any;

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      toast.success('Signed out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <PenSquare className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Journalist Dashboard</h1>
                <p className="text-sm text-gray-500">Access Anomaly Details & Analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="capitalize">
                {user.role || 'public'}
              </Badge>
              <span className="text-sm text-gray-700">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Anomaly Overview</h2>
        <AnomalyDashboard userRole={user.role as 'public' | 'journalist' | 'admin'} />
      </div>
    </div>
  );
};

export default JournalistDashboard;