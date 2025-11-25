"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Building, AlertTriangle, CheckCircle, TrendingUp, Calendar, DollarSign, UserX, Flag, RefreshCw } from 'lucide-react';
import { toast } from "sonner";

interface Vendor {
  _id: string;
  name: string;
  registry_id: string;
  digital_footprint_score: number;
  total_contracts: number;
  total_value: number;
  first_contract_date: string;
  last_contract_date: string;
  anomaly_count: number;
  risk_score: number;
  ministries: string[];
  categories: string[];
  status: 'active' | 'flagged' | 'blacklisted';
  contact_info?: {
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
  };
  registration_date?: string;
}

interface VendorProfilesProps {
  userRole: 'public' | 'journalist' | 'admin';
}

export function VendorProfiles({ userRole }: VendorProfilesProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'flagged' | 'blacklisted'>('all');

  const loadVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/vendors');
      
      if (!response.ok) {
        throw new Error(`Failed to load vendors: ${response.status}`);
      }
      
      const vendorsData = await response.json();
      setVendors(vendorsData);
    } catch (err) {
      console.error('Error loading vendors:', err);
      setError('Failed to load vendors. Please try again.');
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = 
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.registry_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.ministries.some(ministry => 
        ministry.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: 'secondary' as const, icon: CheckCircle, color: 'text-green-600' },
      flagged: { variant: 'destructive' as const, icon: Flag, color: 'text-orange-600' },
      blacklisted: { variant: 'destructive' as const, icon: UserX, color: 'text-red-600' }
    };
    
    const config = variants[status as keyof typeof variants] || variants.active;
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className={`${config.color} border`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRiskBadge = (score: number) => {
    if (score >= 80) return { 
      element: <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">High Risk</Badge>,
      color: 'bg-red-500'
    };
    if (score >= 60) return { 
      element: <Badge variant="default" className="bg-orange-100 text-orange-800 border-orange-200">Medium-High Risk</Badge>,
      color: 'bg-orange-500'
    };
    if (score >= 40) return { 
      element: <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium Risk</Badge>,
      color: 'bg-yellow-500'
    };
    if (score >= 20) return { 
      element: <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">Low Risk</Badge>,
      color: 'bg-blue-500'
    };
    return { 
      element: <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">Minimal Risk</Badge>,
      color: 'bg-green-500'
    };
  };

  const getDigitalFootprintAssessment = (score: number) => {
    if (score >= 80) return { 
      text: 'Strong online presence', 
      description: 'Comprehensive digital footprint with verified business information' 
    };
    if (score >= 60) return { 
      text: 'Good online presence', 
      description: 'Adequate digital presence with most business information available' 
    };
    if (score >= 40) return { 
      text: 'Moderate online presence', 
      description: 'Limited but acceptable digital footprint' 
    };
    if (score >= 20) return { 
      text: 'Weak online presence', 
      description: 'Minimal digital footprint - potential verification needed' 
    };
    return { 
      text: 'Very weak online presence', 
      description: 'Insufficient digital footprint - requires immediate verification' 
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleUpdateVendorStatus = async (vendorId: string, newStatus: 'active' | 'flagged' | 'blacklisted') => {
    if (userRole !== 'admin') return;
    
    try {
      const response = await fetch(`/api/vendors/${vendorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Vendor status updated to ${newStatus}`);
        loadVendors();
        setSelectedVendor(null);
      } else {
        throw new Error('Failed to update vendor status');
      }
    } catch (err) {
      console.error('Error updating vendor status:', err);
      toast.error('Failed to update vendor status');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading vendors...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadVendors} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <CardTitle>Vendor Profiles</CardTitle>
              <CardDescription>
                Analyze vendor history, performance, and risk indicators
              </CardDescription>
            </div>
            <Button 
              onClick={loadVendors} 
              variant="outline" 
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search vendors by name, registry ID, or ministry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="flagged">Flagged</option>
              <option value="blacklisted">Blacklisted</option>
            </select>
          </div>
        </CardHeader>
      </Card>

      {/* Vendor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => {
          const riskBadge = getRiskBadge(vendor.risk_score);
          
          return (
            <Card 
              key={vendor._id} 
              className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                vendor.status === 'flagged' ? 'border-l-4 border-l-orange-500' : 
                vendor.status === 'blacklisted' ? 'border-l-4 border-l-red-700' :
                'border-l-4 border-l-green-500'
              }`}
              onClick={() => setSelectedVendor(vendor)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <CardTitle className="text-lg">{vendor.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {vendor.registry_id}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(vendor.status)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Total Contracts</p>
                    <p className="font-semibold">{vendor.total_contracts}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Value</p>
                    <p className="font-semibold">{formatCurrency(vendor.total_value)}</p>
                  </div>
                </div>

                {/* Risk Score */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Risk Score</span>
                    {riskBadge.element}
                  </div>
                  <Progress value={vendor.risk_score} className="h-2" />
                </div>

                {/* Digital Footprint */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Digital Footprint</span>
                    <span className="text-sm font-medium">{vendor.digital_footprint_score}%</span>
                  </div>
                  <Progress value={vendor.digital_footprint_score} className="h-2" />
                </div>

                {/* Anomalies */}
                {vendor.anomaly_count > 0 && (
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-sm text-red-700">
                        {vendor.anomaly_count} Anomal{vendor.anomaly_count > 1 ? 'ies' : 'y'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Ministries */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Active in:</p>
                  <div className="flex flex-wrap gap-1">
                    {vendor.ministries.slice(0, 2).map((ministry, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {ministry.replace('Ministry of ', '')}
                      </Badge>
                    ))}
                    {vendor.ministries.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{vendor.ministries.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredVendors.length === 0 && vendors.length > 0 && (
        <Card>
          <CardContent className="text-center py-8 text-gray-500">
            No vendors found matching your search criteria.
          </CardContent>
        </Card>
      )}

      {vendors.length === 0 && (
        <Card>
          <CardContent className="text-center py-8 text-gray-500">
            No vendors found in the system.
          </CardContent>
        </Card>
      )}

      {/* Vendor Detail Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Building className="h-6 w-6" />
                    {selectedVendor.name}
                  </CardTitle>
                  <CardDescription>
                    Registry ID: {selectedVendor.registry_id}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(selectedVendor.status)}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedVendor(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Overview Stats */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Overview</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center mb-2">
                          <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="text-sm text-gray-600">Total Contracts</span>
                        </div>
                        <span className="text-xl font-bold">{selectedVendor.total_contracts}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center mb-2">
                          <DollarSign className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm text-gray-600">Total Value</span>
                        </div>
                        <span className="text-xl font-bold">{formatCurrency(selectedVendor.total_value)}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Calendar className="h-4 w-4 text-purple-500 mr-2" />
                          <span className="text-sm text-gray-600">First Contract</span>
                        </div>
                        <span className="text-sm font-medium">{formatDate(selectedVendor.first_contract_date)}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Calendar className="h-4 w-4 text-purple-500 mr-2" />
                          <span className="text-sm text-gray-600">Last Contract</span>
                        </div>
                        <span className="text-sm font-medium">{formatDate(selectedVendor.last_contract_date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Risk Assessment</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Overall Risk Score</span>
                          {getRiskBadge(selectedVendor.risk_score).element}
                        </div>
                        <Progress value={selectedVendor.risk_score} className="h-3" />
                        <p className="text-xs text-gray-500 mt-1">{selectedVendor.risk_score}/100</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Based on digital footprint, anomaly history, and contract patterns
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Digital Footprint Score</span>
                          <span className="text-sm font-medium">{selectedVendor.digital_footprint_score}%</span>
                        </div>
                        <Progress value={selectedVendor.digital_footprint_score} className="h-3" />
                        <p className="text-xs text-gray-500 mt-1">
                          {getDigitalFootprintAssessment(selectedVendor.digital_footprint_score).text}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {getDigitalFootprintAssessment(selectedVendor.digital_footprint_score).description}
                        </p>
                      </div>

                      {selectedVendor.anomaly_count > 0 && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center mb-2">
                            <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                            <span className="text-sm font-medium text-red-700">
                              {selectedVendor.anomaly_count} Anomal{selectedVendor.anomaly_count > 1 ? 'ies' : 'y'} Detected
                            </span>
                          </div>
                          <p className="text-xs text-red-600">
                            This vendor has been flagged for suspicious procurement patterns that require investigation.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Ministries */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Active Ministries</h3>
                    <div className="space-y-2">
                      {selectedVendor.ministries.map((ministry, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">{ministry}</span>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Categories */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Service Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedVendor.categories.map((category, index) => (
                        <Badge key={index} variant="secondary">{category}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  {userRole !== 'public' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Actions</h3>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          View Contract History
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          View Anomaly Details
                        </Button>
                        {userRole === 'admin' && (
                          <div className="space-y-2">
                            <Button 
                              variant="outline" 
                              className="w-full justify-start"
                              onClick={() => handleUpdateVendorStatus(selectedVendor._id, 'flagged')}
                              disabled={selectedVendor.status === 'flagged'}
                            >
                              <Flag className="h-4 w-4 mr-2" />
                              Flag for Investigation
                            </Button>
                            <Button 
                              variant="destructive" 
                              className="w-full justify-start"
                              onClick={() => handleUpdateVendorStatus(selectedVendor._id, 'blacklisted')}
                              disabled={selectedVendor.status === 'blacklisted'}
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Blacklist Vendor
                            </Button>
                            <Button 
                              variant="outline" 
                              className="w-full justify-start text-green-600 border-green-600"
                              onClick={() => handleUpdateVendorStatus(selectedVendor._id, 'active')}
                              disabled={selectedVendor.status === 'active'}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Active
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}