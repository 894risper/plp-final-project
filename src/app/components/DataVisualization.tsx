"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, Users, DollarSign, AlertTriangle } from 'lucide-react';

interface DataVisualizationProps {
  userRole: 'public' | 'journalist' | 'admin';
}

interface ChartData {
  spendingByMinistry: any[];
  vendorConcentration: any[];
  anomaliesByRegion: any[];
  trendData: any[];
  riskByCategory: any[];
}

export function DataVisualization({ userRole }: DataVisualizationProps) {
  const [timeframe, setTimeframe] = useState('12months');
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData>({
    spendingByMinistry: [],
    vendorConcentration: [],
    anomaliesByRegion: [],
    trendData: [],
    riskByCategory: []
  });

  useEffect(() => {
    loadChartData();
  }, [timeframe]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?timeframe=${timeframe}`);
      if (response.ok) {
        const data = await response.json();
        setChartData(data);
      } else {
        console.error('Failed to load analytics data');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  const RISK_COLORS = ['#10B981', '#F59E0B', '#EF4444'];

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

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center h-80">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Data Analytics</CardTitle>
              <CardDescription>
                Comprehensive analysis of procurement patterns and trends
              </CardDescription>
            </div>
            <Select value={timeframe} onValueChange={setTimeframe}>
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
          </div>
        </CardHeader>
      </Card>

      {/* First Row: Spending by Ministry & Vendor Concentration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  formatter={(value: number) => [formatCurrency(value), 'Total Value']}
                  labelFormatter={(label) => `Ministry of ${label}`}
                />
                <Bar dataKey="amount" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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
                  label={({ name, value }) => `${name}: ${value}%`}
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
      </div>

      {/* Second Row: Trends & Risk by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <BarChart data={chartData.riskByCategory} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <YAxis 
                  type="category" 
                  dataKey="category" 
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Risk Score']}
                />
                <Bar dataKey="risk_score">
                  {chartData.riskByCategory.map((entry, index) => (
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
      </div>

      {/* Third Row: Regional Anomalies Heatmap */}
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

      {/* Fourth Row: Spending Trends Area Chart */}
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
              <Tooltip formatter={(value: number) => [formatCurrency(value), 'Spending']} />
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
    </div>
  );
}