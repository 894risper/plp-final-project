"use client"
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, FileText, Users, DollarSign, Shield, LogOut, Plus, CheckCircle, Eye, Edit, Trash2, Building, Search, Filter } from 'lucide-react';
import { toast } from "sonner"
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

interface Contract {
  _id: string;
  contract_id?: string;
  title?: string;
  contractName?: string;
  name?: string;
  vendor_name?: string;
  vendorName?: string;
  vendor_id?: {
    name?: string;
    _id?: string;
  };
  value?: number;
  contractValue?: number;
  amount?: number;
  date_awarded?: string;
  startDate?: string;
  createdAt?: string;
  end_date?: string;
  endDate?: string;
  completion_date?: string;
  description?: string;
  status?: string;
  ministry?: string;
  category?: string;
  anomaly_flags?: string[];
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'public' | 'journalist' | 'admin';
  status: string;
}

export default function Landing() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalContracts: 0,
    totalValue: 0,
    flaggedContracts: 0,
    activeVendors: 0
  });
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContractForm, setShowContractForm] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    status: '',
    completion_date: '',
    value: 0
  });

  // Check if user is logged in
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
    } else {
      router.push('/login');
      return;
    }
    
    loadStats();
    loadContracts();
    setLoading(false);
  }, [router]);

  // Filter contracts when search or filter changes
  useEffect(() => {
    let filtered = contracts;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(contract => 
        (contract.title || contract.contractName || contract.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contract.vendor_name || contract.vendorName || contract.vendor_id?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contract.ministry || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contract => contract.status === statusFilter);
    }

    setFilteredContracts(filtered);
  }, [contracts, searchTerm, statusFilter]);

  const isAdmin = user?.role === 'admin';
  const isJournalist = user?.role === 'journalist';

  const loadStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const statsData = await response.json();
        setStats(statsData);
      }
    } catch {
      // Error is intentionally ignored as it's not critical for the UI
    }
  };

  const loadContracts = async () => {
    try {
      const response = await fetch('/api/contracts');
      if (response.ok) {
        const contractsData = await response.json();
        setContracts(contractsData);
        setFilteredContracts(contractsData);
      } else {
        toast.error('Failed to load contracts');
      }
    } catch {
      toast.error('Failed to load contracts');
    }
  };

  const handleDeleteContract = async (contractId: string) => {
    if (!confirm('Are you sure you want to delete this contract?')) {
      return;
    }

    try {
      const response = await fetch(`/api/contracts/${contractId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Contract deleted successfully');
        loadContracts();
        loadStats();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete contract');
      }
    } catch {
      toast.error('Failed to delete contract');
    }
  };

  const handleEditContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContract) return;

    setEditLoading(true);
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        toast.error('Please log in again');
        return;
      }
      const currentUser = JSON.parse(userData);

      const response = await fetch(`/api/contracts/${editingContract._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editFormData,
          user: currentUser
        }),
      });

      if (response.ok) {
        toast.success('Contract updated successfully');
        setShowEditModal(false);
        setEditingContract(null);
        loadContracts();
        loadStats();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update contract');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update contract';
      toast.error(errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  const openEditModal = (contract: Contract) => {
    setEditingContract(contract);
    setEditFormData({
      title: contract.title || contract.contractName || contract.name || '',
      description: contract.description || '',
      status: contract.status || 'active',
      completion_date: contract.completion_date || '',
      value: contract.value || contract.contractValue || contract.amount || 0
    });
    setShowEditModal(true);
  };

  const openViewModal = (contract: Contract) => {
    setSelectedContract(contract);
    setShowViewModal(true);
  };

  const handleSignOut = () => {
    localStorage.removeItem('user');
    toast.success('Signed out successfully');
    router.push('/login');
  };

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return '$0';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not specified';
    
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    const actualStatus = status || 'active';
    
    const statusConfig = {
      active: { variant: 'default' as const, color: 'bg-green-100 text-green-800 border-green-200', label: 'Active' },
      completed: { variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Completed' },
      terminated: { variant: 'destructive' as const, color: 'bg-red-100 text-red-800 border-red-200', label: 'Terminated' },
      pending: { variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' }
    };

    const config = statusConfig[actualStatus as keyof typeof statusConfig] || statusConfig.active;

    return (
      <Badge variant={config.variant} className={`${config.color} border`}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Corruption Tracker...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
                <p className="text-sm text-gray-500">
                  {isAdmin ? 'Admin Dashboard' : 
                   isJournalist ? 'Journalist Portal' : 
                   'Public Portal'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="capitalize">
                {user.role}
                {user.status === 'active' && user.role === 'journalist' && (
                  <span className="ml-1">✓</span>
                )}
              </Badge>
              <span className="text-sm text-gray-700">{user.email}</span>
              
              {isAdmin && (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => setShowContractForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
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
        {/* User Info */}
        <Card className="mb-8 bg-linear-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Welcome back, {user.firstName}!</h3>
                  <p className="text-sm text-gray-600">
                    {isAdmin ? 'You have full administrative access' : 
                     isJournalist ? 'You can access journalist features' : 
                     'You have public viewing access'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="capitalize">
                  {user.role} Account
                </Badge>
                <p className="text-sm text-gray-500 mt-1">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Contracts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalContracts}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Flagged Contracts</p>
                  <p className="text-2xl font-bold text-red-600">{stats.flaggedContracts}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Vendors</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeVendors}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contract Form Modal */}
        {showContractForm && isAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Create New Contract</h2>
                <p className="text-gray-600">Add a new government contract to the system</p>
              </div>
              <ContractForm 
                onSuccess={() => {
                  setShowContractForm(false);
                  loadContracts();
                  loadStats();
                }} 
              />
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

        {/* View Contract Modal */}
        {showViewModal && selectedContract && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Contract Details</CardTitle>
                <CardDescription>
                  Detailed information about the contract
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Contract Title</Label>
                    <p className="text-sm font-semibold">{selectedContract.title || selectedContract.contractName || selectedContract.name || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Contract ID</Label>
                    <p className="text-sm">{selectedContract.contract_id || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Vendor</Label>
                    <p className="text-sm">{selectedContract.vendor_name || selectedContract.vendorName || selectedContract.vendor_id?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedContract.status)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Contract Value</Label>
                    <p className="text-sm font-semibold text-green-600">
                      {formatCurrency(selectedContract.value || selectedContract.contractValue || selectedContract.amount || 0)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Ministry</Label>
                    <p className="text-sm">{selectedContract.ministry || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Category</Label>
                    <p className="text-sm">{selectedContract.category || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Date Awarded</Label>
                    <p className="text-sm">{formatDate(selectedContract.date_awarded || selectedContract.startDate || selectedContract.createdAt)}</p>
                  </div>
                  {selectedContract.completion_date && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Completion Date</Label>
                      <p className="text-sm">{formatDate(selectedContract.completion_date)}</p>
                    </div>
                  )}
                  {selectedContract.end_date && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">End Date</Label>
                      <p className="text-sm">{formatDate(selectedContract.end_date || selectedContract.endDate)}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Description</Label>
                  <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-3 rounded-md">
                    {selectedContract.description || 'No description available'}
                  </p>
                </div>

                {selectedContract.anomaly_flags && selectedContract.anomaly_flags.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-red-600">Anomaly Flags</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedContract.anomaly_flags.map((flag, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4 border-t">
                  {isAdmin && (
                    <Button
                      onClick={() => {
                        setShowViewModal(false);
                        openEditModal(selectedContract);
                      }}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Contract
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setShowViewModal(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Contract Modal */}
        {showEditModal && editingContract && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Edit Contract</CardTitle>
                <CardDescription>
                  Update contract information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEditContract} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Contract Title</Label>
                      <Input
                        id="title"
                        value={editFormData.title}
                        onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                        placeholder="Enter contract title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="value">Contract Value ($)</Label>
                      <Input
                        id="value"
                        type="number"
                        value={editFormData.value}
                        onChange={(e) => setEditFormData({...editFormData, value: Number(e.target.value)})}
                        placeholder="Enter contract value"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={editFormData.status} onValueChange={(value) => setEditFormData({...editFormData, status: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="terminated">Terminated</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="completion_date">Completion Date</Label>
                      <Input
                        id="completion_date"
                        type="date"
                        value={editFormData.completion_date}
                        onChange={(e) => setEditFormData({...editFormData, completion_date: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                      placeholder="Enter contract description"
                      rows={4}
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <Button type="submit" disabled={editLoading} className="flex-1">
                      {editLoading ? 'Updating...' : 'Update Contract'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingContract(null);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

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
            {isAdmin && (
              <TabsTrigger value="verification">
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify Users
              </TabsTrigger>
            )}
          </TabsList>

          {/* Contracts Tab - Updated to Table View */}
          <TabsContent value="contracts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Government Contracts</CardTitle>
                  <CardDescription>
                    {isAdmin 
                      ? 'Manage all government contracts. You can create, view, edit, and delete contracts.'
                      : 'View government contracts and procurement data.'
                    }
                  </CardDescription>
                </div>
                {isAdmin && (
                  <Button 
                    onClick={() => setShowContractForm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contract
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {/* Search and Filter Section */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search contracts, vendors, or ministries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="terminated">Terminated</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    {(searchTerm || statusFilter !== 'all') && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                        }}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>

                {filteredContracts.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {contracts.length === 0 ? 'No contracts found' : 'No matching contracts'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {contracts.length === 0
                        ? (isAdmin 
                            ? 'Get started by creating your first government contract.'
                            : 'No contracts available at the moment.'
                          )
                        : 'Try adjusting your search or filter criteria.'
                      }
                    </p>
                    {isAdmin && contracts.length === 0 && (
                      <Button onClick={() => setShowContractForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Contract
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Contract</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Vendor</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Value</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Ministry</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Date Awarded</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredContracts.map((contract) => {
                            const contractName = contract.title || contract.contractName || contract.name || 'Unnamed Contract';
                            const vendorName = contract.vendor_name || contract.vendorName || 
                                              (contract.vendor_id?.name) || 'Unknown Vendor';
                            const contractValue = contract.value || contract.contractValue || contract.amount || 0;
                            const startDate = contract.date_awarded || contract.startDate || contract.createdAt;
                            const status = contract.status || 'active';

                            return (
                              <tr key={contract._id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4">
                                  <div>
                                    <div className="font-medium text-gray-900">{contractName}</div>
                                    {contract.contract_id && (
                                      <div className="text-sm text-gray-500">ID: {contract.contract_id}</div>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-700">{vendorName}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="font-semibold text-green-600">
                                    {formatCurrency(contractValue)}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  {getStatusBadge(status)}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="text-gray-700">
                                    {contract.ministry || 'N/A'}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="text-gray-700">
                                    {formatDate(startDate)}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openViewModal(contract)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    {isAdmin && (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => openEditModal(contract)}
                                          className="h-8 w-8 p-0"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteContract(contract._id)}
                                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other Tabs */}
          <TabsContent value="vendors">
            <VendorProfiles userRole={user.role} />
          </TabsContent>

          <TabsContent value="whistleblower">
            <WhistleblowerPortal userRole={user.role} />
          </TabsContent>

          <TabsContent value="analytics">
            <DataVisualization />
          </TabsContent>

          <TabsContent value="anomalies">
            <AnomalyDashboard userRole={user.role} />
          </TabsContent>

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