import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Shield, AlertCircle } from 'lucide-react';
import { toast } from "sonner@2.0.3";

interface LoginFormProps {
  onLogin: (user: any) => void;
}

const DEMO_ACCOUNTS = [
  {
    id: 'demo-public',
    email: 'public@demo.com',
    password: 'demo123',
    role: 'public',
    name: 'Public User'
  },
  {
    id: 'demo-journalist',
    email: 'journalist@demo.com',
    password: 'demo123',
    role: 'journalist',
    name: 'Jane Reporter'
  },
  {
    id: 'demo-admin',
    email: 'admin@demo.com',
    password: 'demo123',
    role: 'admin',
    name: 'Admin User'
  }
];

export function LoginForm({ onLogin }: LoginFormProps) {
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Find matching demo account
      const demoAccount = DEMO_ACCOUNTS.find(
        account => account.email === loginData.email && account.password === loginData.password
      );

      if (demoAccount) {
        const user = {
          id: demoAccount.id,
          email: demoAccount.email,
          role: demoAccount.role
        };
        
        // Save to localStorage for persistence
        localStorage.setItem('corruption-tracker-user', JSON.stringify(user));
        
        onLogin(user);
        toast.success(`Logged in successfully as ${demoAccount.name}`);
      } else {
        toast.error('Invalid credentials. Please use one of the demo accounts.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (account: typeof DEMO_ACCOUNTS[0]) => {
    setLoginData({ email: account.email, password: account.password });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Corruption Tracker</CardTitle>
          <CardDescription>
            Government Procurement Transparency Platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 space-y-4">
            <div className="flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <div className="px-4 text-sm text-gray-500">Demo Accounts</div>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
            
            {DEMO_ACCOUNTS.map((account) => (
              <div key={account.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium capitalize">{account.role}</p>
                    <p className="text-xs text-gray-600">{account.email}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemoLogin(account)}
                  >
                    Use Account
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Access Levels:</p>
                  <p>• Public: View contracts and basic data</p>
                  <p>• Journalist: Access anomaly details and analysis</p>
                  <p>• Admin: Full access including reports and management</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}