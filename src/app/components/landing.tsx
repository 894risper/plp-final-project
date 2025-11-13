"use client"
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, FileText, Users, DollarSign, Shield, LogOut, Plus, Settings } from 'lucide-react';
import { toast } from "sonner"
import { useSession, signOut } from "next-auth/react";
import { useRouter } from 'next/navigation';

import { VendorProfiles } from './VendorProfiles';
import { WhistleblowerPortal } from './WhistleblowerPortal';
import { DataVisualization } from './DataVisualization';
import { AnomalyDashboard } from './AnomalyDashboard';
import { ContractForm } from '../components/ContractForm';

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

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
    
    loadStats();
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
        {/* Contract Form Modal for Admin */}
        {showContractForm && isAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <ContractForm onSuccess={() => {
                setShowContractForm(false);
                loadStats(); // Refresh stats after adding contract
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalContracts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Monitored contracts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
              <p className="text-xs text-muted-foreground">Contract value tracked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flagged Contracts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.flaggedContracts}</div>
              <p className="text-xs text-muted-foreground">Potential anomalies</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeVendors}</div>
              <p className="text-xs text-muted-foreground">Registered vendors</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="contracts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="whistleblower">
              <Shield className="h-4 w-4 mr-2" />
              Report
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contracts">
            <Card>
              <CardHeader>
                <CardTitle>Contracts</CardTitle>
                <CardDescription>
                  View and manage all government contracts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isAdmin ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Contract Management</h3>
                    <p className="text-gray-600 mb-4">
                      Use the "Add Contract" button above to enter new contract data.
                    </p>
                    <Button onClick={() => setShowContractForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Contract
                    </Button>
                  </div>
                ) : (
                  <p>Contract viewing features coming soon...</p>
                )}
              </CardContent>
            </Card>
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
        </Tabs>
      </div>
    </div>
  );
}