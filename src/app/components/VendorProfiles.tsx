"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Building, AlertTriangle, CheckCircle, TrendingUp, Calendar, DollarSign } from 'lucide-react';

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
}

interface VendorProfilesProps {
  userRole: 'public' | 'journalist' | 'admin';
}

export function VendorProfiles({ userRole }: VendorProfilesProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/vendors');
      if (response.ok) {
        const vendorsData = await response.json();
        setVendors(vendorsData);
      } else {
        console.error('Failed to load vendors');
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.registry_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'secondary',
      flagged: 'destructive',
      blacklisted: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
        {status !== 'active' && <AlertTriangle className="h-3 w-3 mr-1" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRiskBadge = (score: number) => {
    if (score >= 80) return <Badge variant="destructive">High Risk</Badge>;
    if (score >= 50) return <Badge variant="default">Medium Risk</Badge>;
    if (score >= 20) return <Badge variant="secondary">Low Risk</Badge>;
    return <Badge variant="outline" className="text-green-600 border-green-600">Minimal Risk</Badge>;
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

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Profiles</CardTitle>
          <CardDescription>
            Analyze vendor history, performance, and risk indicators
          </CardDescription>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search vendors by name or registry ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
      </Card>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <Card 
            key={vendor._id} 
            className={`cursor-pointer transition-shadow hover:shadow-lg ${
              vendor.status === 'flagged' ? 'border-l-4 border-l-red-500' : 
              vendor.status === 'blacklisted' ? 'border-l-4 border-l-red-700' : ''
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
                  {getRiskBadge(vendor.risk_score)}
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
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <Card>
          <CardContent className="text-center py-8 text-gray-500">
            No vendors found matching your search criteria.
          </CardContent>
        </Card>
      )}

      {/* Vendor Detail Modal/Panel */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{selectedVendor.name}</CardTitle>
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
                          {getRiskBadge(selectedVendor.risk_score)}
                        </div>
                        <Progress value={selectedVendor.risk_score} className="h-3" />
                        <p className="text-xs text-gray-500 mt-1">{selectedVendor.risk_score}/100</p>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Digital Footprint Score</span>
                          <span className="text-sm font-medium">{selectedVendor.digital_footprint_score}%</span>
                        </div>
                        <Progress value={selectedVendor.digital_footprint_score} className="h-3" />
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedVendor.digital_footprint_score >= 80 ? 'Strong online presence' :
                           selectedVendor.digital_footprint_score >= 50 ? 'Moderate online presence' :
                           'Weak online presence - potential red flag'}
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
                            This vendor has been flagged for suspicious procurement patterns.
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
                          <>
                            <Button variant="outline" className="w-full justify-start">
                              Update Risk Assessment
                            </Button>
                            <Button variant="destructive" className="w-full justify-start">
                              Flag for Investigation
                            </Button>
                          </>
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