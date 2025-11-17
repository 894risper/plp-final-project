"use client"
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, FileText, Users, DollarSign, Shield, LogOut, Plus, Settings, CheckCircle } from 'lucide-react';
import { toast } from "sonner"
import { useSession, signOut } from "next-auth/react";
import { useRouter } from 'next/navigation';

import { VendorProfiles } from './VendorProfiles';
import { WhistleblowerPortal } from './WhistleblowerPortal';
import { DataVisualization } from './DataVisualization';
import { AnomalyDashboard } from './AnomalyDashboard';
import { ContractForm } from '../components/ContractForm';
import { UserVerification } from '../components/UserVerification';

interface Stats {
  totalContracts: number;
  totalValue: number;
  flaggedContracts: number;
  activeVendors: number;
}

// Simple role check functions
const useUserRole = () => {
  const { data: session } = useSession()
  return (session?.user as any)?.role || 'public'
}

const hasAccess = (userRole: string, requiredRole: string) => {
  const roleHierarchy = {
    'public': 1,
    'journalist': 2,
    'admin': 3
  }
  
  return roleHierarchy[userRole as keyof typeof roleHierarchy] >= roleHierarchy[requiredRole as keyof typeof roleHierarchy]
}

export default function Landing() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userRole = useUserRole();
  const isAdmin = hasAccess(userRole, 'admin');
  const isJournalist = hasAccess(userRole, 'journalist');
  
  const [stats, setStats] = useState<Stats>({
    totalContracts: 0,
    totalValue: 0,
    flaggedContracts: 0,
    activeVendors: 0
  });
  const [loading, setLoading] = useState(true);
  const [showContractForm, setShowContractForm] = useState(false);
  const [contracts, setContracts] = useState<any[]>([]);

  // Optional debug logs
  useEffect(() => {
    console.log('Session:', session);
    console.log('User Role:', userRole);
    console.log('Is Admin:', isAdmin);
    console.log('Is Journalist:', isJournalist);
  }, [session, userRole, isAdmin, isJournalist]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    loadStats();
    loadContracts();
  }, [session, status, router]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stats');
      if (response.ok) {
        const statsData = await response.json();
        setStats(statsData);
      } else {
        toast.error('Failed to load statistics');
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const loadContracts = async () => {
    try {
      const response = await fetch('/api/contracts');
      if (response.ok) {
        const data = await response.json();
        setContracts(Array.isArray(data) ? data : []);
      } else {
        toast.error('Failed to load contracts');
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
      toast.error('Failed to load contracts');
    }
  };

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Corruption Tracker...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user as any;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Corruption Tracker</h1>
                <p className="text-sm text-gray-500">Government Procurement Transparency</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* DEBUG: Show role info */}
              <Badge variant="outline" className="capitalize">
                {user.role || 'public'}
              </Badge>
              <span className="text-sm text-gray-700">{user.email}</span>
              
              {isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowContractForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contract
                </Button>
              )}
              
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* DEBUG: Show access info */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Debug Info</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• <strong>User Role:</strong> {user.role}</p>
                  <p>• <strong>Is Admin:</strong> {isAdmin ? 'YES' : 'NO'}</p>
                  <p>• <strong>Is Journalist:</strong> {isJournalist ? 'YES' : 'NO'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rest of your landing page code remains the same */}
        {/* Contract Form Modal */}
        {showContractForm && isAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <ContractForm onSuccess={() => {
                setShowContractForm(false);
                loadStats();
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

        {/* Access Level Info */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Access Levels</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• <strong>Public:</strong> View contracts and basic data</p>
                  <p>• <strong>Journalist:</strong> Access anomaly details and analysis</p>
                  <p>• <strong>Admin:</strong> Full access including data entry and management</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Your stats cards */}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="contracts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="whistleblower">
              <Shield className="h-4 w-4 mr-2" />
              Report
            </TabsTrigger>
            {/* DEBUG: This should show for admin */}
            {isAdmin && (
              <TabsTrigger value="verification">
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify Users
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="contracts">
            {/* Contracts content */}
          </TabsContent>

          <TabsContent value="vendors">
            <VendorProfiles userRole={user.role as 'public' | 'journalist' | 'admin'} />
          </TabsContent>

          <TabsContent value="whistleblower">
            <WhistleblowerPortal userRole={user.role as 'public' | 'journalist' | 'admin'} />
          </TabsContent>

          <TabsContent value="analytics">
            <DataVisualization userRole={user.role as 'public' | 'journalist' | 'admin'} />
          </TabsContent>

          <TabsContent value="anomalies">
            <AnomalyDashboard userRole={user.role as 'public' | 'journalist' | 'admin'} />
          </TabsContent>

          {/* DEBUG: This should show for admin */}
          {isAdmin && (
            <TabsContent value="verification">
              <UserVerification />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}