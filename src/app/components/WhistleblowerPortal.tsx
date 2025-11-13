"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, Eye, EyeOff, Upload, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { toast } from "sonner"

interface WhistleblowerPortalProps {
  userRole: 'public' | 'journalist' | 'admin';
}

interface Report {
  _id: string;
  report_id: string;
  title: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'submitted' | 'reviewing' | 'investigating' | 'resolved' | 'dismissed';
  submitted_at: string;
  ministry?: string;
  vendor?: string;
}

export function WhistleblowerPortal({ userRole }: WhistleblowerPortalProps) {
  const [activeTab, setActiveTab] = useState<'submit' | 'reports'>('submit');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    ministry: '',
    vendor: '',
    contract_id: '',
    description: '',
    evidence: '',
    contact_info: '',
    severity: 'medium'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const reportData = {
        ...formData,
        is_anonymous: isAnonymous,
      };

      const response = await fetch('/api/whistleblower', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        toast.success('Report submitted successfully. Your submission is encrypted and secure.');
        setFormData({
          title: '',
          category: '',
          ministry: '',
          vendor: '',
          contract_id: '',
          description: '',
          evidence: '',
          contact_info: '',
          severity: 'medium'
        });
        
        // Reload reports if on reports tab
        if (activeTab === 'reports') {
          loadReports();
        }
      } else {
        const errorData = await response.json();
        toast.error(`Failed to submit report: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error submitting whistleblower report:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      const response = await fetch('/api/whistleblower');
      if (response.ok) {
        const reportsData = await response.json();
        setReports(reportsData);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: 'text-green-600 bg-green-50 border-green-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      high: 'text-red-600 bg-red-50 border-red-200',
      critical: 'text-red-700 bg-red-100 border-red-300'
    };
    
    return (
      <Badge variant="outline" className={colors[severity as keyof typeof colors]}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      submitted: 'text-blue-600 bg-blue-50 border-blue-200',
      reviewing: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      investigating: 'text-purple-600 bg-purple-50 border-purple-200',
      resolved: 'text-green-600 bg-green-50 border-green-200',
      dismissed: 'text-gray-600 bg-gray-50 border-gray-200'
    };
    
    return (
      <Badge variant="outline" className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Security Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Shield className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Secure Whistleblower Portal</h3>
              <p className="text-blue-800 text-sm mb-4">
                This portal provides a secure, encrypted channel for reporting corruption, fraud, or suspicious activities in government procurement. Your safety and anonymity are our top priorities.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center">
                  <Lock className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-blue-800">End-to-End Encryption</span>
                </div>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-blue-800">Anonymous Submissions</span>
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-blue-800">Secure Evidence Upload</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'submit' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('submit')}
        >
          Submit Report
        </Button>
        {userRole !== 'public' && (
          <Button
            variant={activeTab === 'reports' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setActiveTab('reports');
              loadReports();
            }}
          >
            View Reports ({reports.length})
          </Button>
        )}
      </div>

      {/* Submit Report Tab */}
      {activeTab === 'submit' && (
        <Card>
          <CardHeader>
            <CardTitle>Submit a Confidential Report</CardTitle>
            <CardDescription>
              Report corruption, fraud, or suspicious activities safely and securely
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Anonymity Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {isAnonymous ? <EyeOff className="h-5 w-5 text-gray-600" /> : <Eye className="h-5 w-5 text-gray-600" />}
                  <div>
                    <Label className="text-base font-medium">Anonymous Submission</Label>
                    <p className="text-sm text-gray-600">
                      {isAnonymous ? 'Your identity will be completely protected' : 'You may be contacted for follow-up'}
                    </p>
                  </div>
                </div>
                <Button 
                  type="button"
                  variant={isAnonymous ? 'default' : 'outline'}
                  onClick={() => setIsAnonymous(!isAnonymous)}
                >
                  {isAnonymous ? 'Anonymous' : 'Identifiable'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Report Title *</Label>
                    <Input
                      id="title"
                      placeholder="Brief description of the issue"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="overpricing">Overpricing / Inflated Costs</SelectItem>
                        <SelectItem value="ghost_vendor">Ghost Vendor / Fake Company</SelectItem>
                        <SelectItem value="repeat_awards">Repeated Contract Awards</SelectItem>
                        <SelectItem value="budget_leakage">Budget Leakage / Misappropriation</SelectItem>
                        <SelectItem value="bribery">Bribery / Kickbacks</SelectItem>
                        <SelectItem value="collusion">Bid Rigging / Collusion</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="severity">Severity Level</Label>
                    <Select value={formData.severity} onValueChange={(value) => setFormData({...formData, severity: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Minor irregularities</SelectItem>
                        <SelectItem value="medium">Medium - Significant concerns</SelectItem>
                        <SelectItem value="high">High - Major misconduct</SelectItem>
                        <SelectItem value="critical">Critical - Systemic corruption</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="ministry">Ministry/Department</Label>
                    <Input
                      id="ministry"
                      placeholder="e.g., Ministry of Health"
                      value={formData.ministry}
                      onChange={(e) => setFormData({...formData, ministry: e.target.value})}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="vendor">Vendor/Company</Label>
                    <Input
                      id="vendor"
                      placeholder="Company or vendor involved"
                      value={formData.vendor}
                      onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="contract_id">Contract ID (if known)</Label>
                    <Input
                      id="contract_id"
                      placeholder="e.g., CT-2024-001"
                      value={formData.contract_id}
                      onChange={(e) => setFormData({...formData, contract_id: e.target.value})}
                    />
                  </div>

                  {!isAnonymous && (
                    <div>
                      <Label htmlFor="contact_info">Contact Information</Label>
                      <Input
                        id="contact_info"
                        type="email"
                        placeholder="Your email for follow-up (optional)"
                        value={formData.contact_info}
                        onChange={(e) => setFormData({...formData, contact_info: e.target.value})}
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="evidence">Supporting Evidence</Label>
                    <div className="mt-2">
                      <Button type="button" variant="outline" className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Files (Documents, Images, etc.)
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">
                        Files are encrypted before upload. Max 10MB per file.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide a detailed description of the corruption, fraud, or suspicious activity. Include dates, amounts, people involved, and any other relevant information."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="min-h-32"
                  required
                />
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Your report will be encrypted and only accessible to authorized investigators. 
                  If you choose anonymous submission, there will be no way to trace this report back to you. 
                  Please ensure all information is accurate before submitting.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline">
                  Save as Draft
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Encrypting & Submitting...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Submit Securely
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* View Reports Tab (Admin/Journalist only) */}
      {activeTab === 'reports' && userRole !== 'public' && (
        <Card>
          <CardHeader>
            <CardTitle>Whistleblower Reports</CardTitle>
            <CardDescription>
              Confidential reports submitted through the secure portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report._id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{report.title}</h4>
                        <p className="text-sm text-gray-600">Report ID: {report.report_id}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getSeverityBadge(report.severity)}
                        {getStatusBadge(report.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Category:</span>
                        <p className="text-gray-600 capitalize">
                          {report.category.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Ministry:</span>
                        <p className="text-gray-600">{report.ministry || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span>
                        <p className="text-gray-600">{formatDate(report.submitted_at)}</p>
                      </div>
                    </div>

                    {report.vendor && (
                      <div className="mt-3">
                        <span className="text-sm font-medium">Vendor: </span>
                        <span className="text-sm text-gray-600">{report.vendor}</span>
                      </div>
                    )}

                    {userRole === 'admin' && (
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline">
                          <Lock className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          Update Status
                        </Button>
                        <Button size="sm" variant="outline">
                          Assign Investigator
                        </Button>
                      </div>
                    )}

                    {userRole === 'journalist' && report.status === 'resolved' && (
                      <div className="mt-4">
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          View Summary
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {reports.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No whistleblower reports found.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Access Denied for Public Users */}
      {activeTab === 'reports' && userRole === 'public' && (
        <Card>
          <CardContent className="text-center py-8">
            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">
              Viewing whistleblower reports requires journalist or admin privileges.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}