"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, TrendingUp, Eye, Users, DollarSign, Clock } from 'lucide-react';

interface Anomaly {
  _id: string;
  anomaly_id: string;
  contract_id: string;
  contract_title: string;
  vendor_name: string;
  ministry: string;
  rule_triggered: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  description: string;
  impact_value: number;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
}

interface AnomalyDashboardProps {
  userRole: 'public' | 'journalist' | 'admin';
}

export function AnomalyDashboard({ userRole }: AnomalyDashboardProps) {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ruleFilter, setRuleFilter] = useState('all');

  useEffect(() => {
    loadAnomalies();
  }, []);

  const loadAnomalies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/anomalies');
      if (response.ok) {
        const anomaliesData = await response.json();
        setAnomalies(anomaliesData);
      } else {
        console.error('Failed to load anomalies');
      }
    } catch (error) {
      console.error('Error loading anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnomalies = anomalies.filter(anomaly => {
    const matchesSeverity = severityFilter === 'all' || anomaly.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || anomaly.status === statusFilter;
    const matchesRule = ruleFilter === 'all' || anomaly.rule_triggered === ruleFilter;
    
    return matchesSeverity && matchesStatus && matchesRule;
  });

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: 'text-green-600 bg-green-50 border-green-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      high: 'text-red-600 bg-red-50 border-red-200',
      critical: 'text-red-700 bg-red-100 border-red-300'
    };
    
    return (
      <Badge variant="outline" className={colors[severity as keyof typeof colors]}>
        {severity === 'critical' && <AlertTriangle className="h-3 w-3 mr-1" />}
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      open: 'text-red-600 bg-red-50 border-red-200',
      investigating: 'text-blue-600 bg-blue-50 border-blue-200',
      resolved: 'text-green-600 bg-green-50 border-green-200',
      false_positive: 'text-gray-600 bg-gray-50 border-gray-200'
    };
    
    return (
      <Badge variant="outline" className={colors[status as keyof typeof colors]}>
        {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </Badge>
    );
  };

  const getRuleBadge = (rule: string) => {
    const ruleNames = {
      overpricing: 'Overpricing',
      ghost_vendor: 'Ghost Vendor',
      repeat_awards: 'Repeat Awards',
      budget_leakage: 'Budget Leakage'
    };
    
    return (
      <Badge variant="outline">
        {ruleNames[rule as keyof typeof ruleNames] || rule}
      </Badge>
    );
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const anomalyStats = {
    total: anomalies.length,
    critical: anomalies.filter(a => a.severity === 'critical').length,
    high: anomalies.filter(a => a.severity === 'high').length,
    open: anomalies.filter(a => a.status === 'open').length,
    totalImpact: anomalies.reduce((sum, a) => sum + a.impact_value, 0)
  };

  const rules = [...new Set(anomalies.map(a => a.rule_triggered))];

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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Anomalies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{anomalyStats.total}</div>
            <p className="text-xs text-muted-foreground">Detected patterns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{anomalyStats.critical + anomalyStats.high}</div>
            <p className="text-xs text-muted-foreground">High priority cases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Cases</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{anomalyStats.open}</div>
            <p className="text-xs text-muted-foreground">Require investigation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financial Impact</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(anomalyStats.totalImpact)}</div>
            <p className="text-xs text-muted-foreground">Potentially at risk</p>
          </CardContent>
        </Card>
      </div>

      {/* Anomalies List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Detected Anomalies</CardTitle>
              <CardDescription>
                Procurement patterns flagged by automated analysis
              </CardDescription>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="false_positive">False Positive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ruleFilter} onValueChange={setRuleFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Rule Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rules</SelectItem>
                {rules.map(rule => (
                  <SelectItem key={rule} value={rule}>
                    {rule.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {filteredAnomalies.map((anomaly) => (
              <Card key={anomaly._id} className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-wrap gap-2">
                      {getSeverityBadge(anomaly.severity)}
                      {getStatusBadge(anomaly.status)}
                      {getRuleBadge(anomaly.rule_triggered)}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDate(anomaly.timestamp)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{anomaly.contract_title}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Contract ID: {anomaly.contract_id}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Vendor:</span> {anomaly.vendor_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Ministry:</span> {anomaly.ministry}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-700 mb-2">{anomaly.description}</p>
                      <p className="text-sm font-medium text-gray-900">
                        Potential Impact: {formatCurrency(anomaly.impact_value)}
                      </p>
                      
                      {userRole !== 'public' && (
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                          {userRole === 'admin' && (
                            <Button size="sm" variant="outline">
                              Update Status
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredAnomalies.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No anomalies found matching your criteria.
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredAnomalies.length} of {anomalies.length} anomalies
          </div>
        </CardContent>
      </Card>
    </div>
  );
}