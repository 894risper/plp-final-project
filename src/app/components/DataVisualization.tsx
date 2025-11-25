"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, DollarSign, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface DataVisualizationProps {
  timeframe?: string;
  onTimeframeChange?: (timeframe: string) => void;
}

interface SpendingByMinistry {
  ministry: string;
  amount: number;
  contracts: number;
}

interface VendorConcentration {
  name: string;
  value: number;
}

interface AnomaliesByRegion {
  region: string;
  total: number;
  overpricing: number;
  ghost_vendors: number;
  repeat_awards: number;
  budget_leakage: number;
}

interface TrendData {
  month: string;
  contracts: number;
  spending: number;
  anomalies: number;
}

interface RiskByCategory {
  category: string;
  total_value: number;
  contracts: number;
  risk_score: number;
}

interface ChartData {
  spendingByMinistry: SpendingByMinistry[];
  vendorConcentration: VendorConcentration[];
  anomaliesByRegion: AnomaliesByRegion[];
  trendData: TrendData[];
  riskByCategory: RiskByCategory[];
}

export function DataVisualization({ timeframe: externalTimeframe, onTimeframeChange }: DataVisualizationProps) {
  const [internalTimeframe, setInternalTimeframe] = useState('12months');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData>({
    spendingByMinistry: [],
    vendorConcentration: [],
    anomaliesByRegion: [],
    trendData: [],
    riskByCategory: []
  });

  // Use external timeframe if provided, otherwise use internal state
  const timeframe = externalTimeframe || internalTimeframe;

  const loadChartData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/analytics?timeframe=${timeframe}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load analytics data: ${response.status}`);
      }
      
      const data = await response.json();
      setChartData(data);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    loadChartData();
  }, [loadChartData]);

  const handleTimeframeChange = (value: string) => {
    if (onTimeframeChange) {
      onTimeframeChange(value);
    } else {
      setInternalTimeframe(value);
    }
  };

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyShort = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(0)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  // Prepare data for horizontal bar chart
  const horizontalRiskData = chartData.riskByCategory.map(item => ({
    ...item,
    categoryShort: item.category.length > 20 
      ? item.category.substring(0, 20) + '...' 
      : item.category
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analytics data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-600 mb-4 text-center">{error}</p>
            <Button onClick={loadChartData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if we have any data
  const hasData = Object.values(chartData).some(data => data && data.length > 0);

  if (!hasData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <TrendingUp className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-center mb-4">No analytics data available yet.</p>
            <p className="text-gray-500 text-center text-sm">
              Analytics will appear here once you have contracts and anomalies in the system.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <CardTitle>Data Analytics</CardTitle>
              <CardDescription>
                Real-time analysis of procurement patterns and trends from your data
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={timeframe} onValueChange={handleTimeframeChange}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Last 3 months</SelectItem>
                  <SelectItem value="6months">Last 6 months</SelectItem>
                  <SelectItem value="12months">Last 12 months</SelectItem>
                  <SelectItem value="24months">Last 24 months</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={loadChartData} 
                variant="outline" 
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Charts - Only render if data exists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartData.spendingByMinistry.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Spending by Ministry
              </CardTitle>
              <CardDescription>
                Contract values distributed across government ministries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.spendingByMinistry}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="ministry" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tickFormatter={formatCurrencyShort}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value as number), 'Total Value']}
                  />
                  <Bar dataKey="amount" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {chartData.vendorConcentration.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                Vendor Concentration
              </CardTitle>
              <CardDescription>
                Distribution of contract values among vendors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.vendorConcentration}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }: { name: string; value: number }) => `${name}: ${value}%`}
                    labelLine={false}
                  >
                    {chartData.vendorConcentration.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value}%`, 'Share']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Second Row: Trends & Risk by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartData.trendData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Monthly Trends
              </CardTitle>
              <CardDescription>
                Contract volume and anomaly detection over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="contracts" orientation="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="anomalies" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line 
                    yAxisId="contracts" 
                    type="monotone" 
                    dataKey="contracts" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Contracts"
                  />
                  <Line 
                    yAxisId="anomalies" 
                    type="monotone" 
                    dataKey="anomalies" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    name="Anomalies"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {chartData.riskByCategory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                Risk by Category
              </CardTitle>
              <CardDescription>
                Risk assessment across procurement categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={horizontalRiskData}
                  layout="vertical"
                  margin={{ left: 100, right: 30, top: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis 
                    type="number" 
                    domain={[0, 100]} 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="categoryShort"
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Risk Score']}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0] && payload[0].payload) {
                        const originalCategory = (payload[0].payload as RiskByCategory).category;
                        return originalCategory;
                      }
                      return label;
                    }}
                  />
                  <Bar 
                    dataKey="risk_score" 
                    name="Risk Score"
                  >
                    {horizontalRiskData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={
                          entry.risk_score >= 70 
                            ? '#EF4444' 
                            : entry.risk_score >= 40 
                            ? '#F59E0B' 
                            : '#10B981'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Third Row: Regional Anomalies Heatmap */}
      {chartData.anomaliesByRegion.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
              Regional Anomaly Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of anomaly types across different regions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData.anomaliesByRegion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="overpricing" stackId="a" fill="#EF4444" name="Overpricing" />
                <Bar dataKey="ghost_vendors" stackId="a" fill="#F59E0B" name="Ghost Vendors" />
                <Bar dataKey="repeat_awards" stackId="a" fill="#8B5CF6" name="Repeat Awards" />
                <Bar dataKey="budget_leakage" stackId="a" fill="#EC4899" name="Budget Leakage" />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-4 flex flex-wrap gap-4 justify-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                <span className="text-sm">Overpricing</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                <span className="text-sm">Ghost Vendors</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                <span className="text-sm">Repeat Awards</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-pink-500 rounded mr-2"></div>
                <span className="text-sm">Budget Leakage</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fourth Row: Spending Trends Area Chart */}
      {chartData.trendData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Monthly Spending Trends
            </CardTitle>
            <CardDescription>
              Total government procurement spending over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatCurrencyShort} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [formatCurrency(value as number), 'Spending']} />
                <Area 
                  type="monotone" 
                  dataKey="spending" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}