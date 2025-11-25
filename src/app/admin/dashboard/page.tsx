"use client"
import React, { useState } from 'react';
import { useSession, signOut } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { Shield, LogOut, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { UserVerification } from '../../components/UserVerification';
import { ContractForm } from '../../components/ContractForm'; // Import ContractForm

const AdminDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showContractForm, setShowContractForm] = useState(false); // State for modal

  // Redirect to login if not authenticated or not admin (basic check, more robust RBAC would be middleware)
  React.useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any)?.role !== 'admin') {
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading' || !session || (session.user as any)?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Admin Dashboard...</p>
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
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Manage Users & System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="capitalize">
                {user.role || 'public'}
              </Badge>
              <span className="text-sm text-gray-700">{user.email}</span>
              
              {/* Add Contract Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowContractForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Contract
              </Button>

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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management</h2>
        <UserVerification />
      </div>

      {/* Contract Form Modal */}
      {showContractForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ContractForm onSuccess={() => {
              setShowContractForm(false);
              toast.success('Contract added successfully!');
              // No explicit reload here, as contracts are viewed on the landing page
            }} />
            <div className="p-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowContractForm(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;