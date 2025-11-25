"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { CheckCircle, XCircle, Clock, User, Building, Mail, Phone } from 'lucide-react'

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  status: 'pending' | 'active' | 'suspended' | 'rejected'
  organization?: string
  phone: number
  verificationNotes?: string
  createdAt: string
}

export function UserVerification() {
  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [verificationNotes, setVerificationNotes] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Get user from localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        toast.error('Please log in again');
        return;
      }
      const user = JSON.parse(userData);

      // Load pending users with user data
      const pendingResponse = await fetch('/api/admin/pending-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user })
      });
      
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingUsers(pendingData);
      } else {
        toast.error('Failed to load pending users');
      }

      // Load all users
      const allResponse = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user })
      });
      
      if (allResponse.ok) {
        const allData = await allResponse.json();
        setAllUsers(allData);
      }

    } catch (err) {
      console.error('Error loading users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  const handleVerifyUser = async (status: 'active' | 'rejected' | 'suspended') => {
    if (!selectedUser) return;

    try {
      setActionLoading(selectedUser._id);
      
      // Get user from localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        toast.error('Please log in again');
        return;
      }
      const user = JSON.parse(userData);

      const response = await fetch('/api/admin/verify-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser._id,
          status,
          notes: verificationNotes || undefined,
          user
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || `User ${status} successfully`);
        setSelectedUser(null);
        setVerificationNotes('');
        await loadUsers();
      } else {
        throw new Error(result.error || 'Failed to update user status');
      }
    } catch (err: unknown) {
      console.error('Error verifying user:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user status';
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, text: 'Pending', color: 'text-yellow-600' },
      active: { variant: 'default' as const, icon: CheckCircle, text: 'Active', color: 'text-green-600' },
      rejected: { variant: 'destructive' as const, icon: XCircle, text: 'Rejected', color: 'text-red-600' },
      suspended: { variant: 'outline' as const, icon: XCircle, text: 'Suspended', color: 'text-orange-600' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const IconComponent = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-24 justify-center">
        <IconComponent className="h-3 w-3" />
        {config.text}
      </Badge>
    )
  }

  const allJournalists = allUsers.filter(user => user.role === 'journalist')
  const publicUsers = allUsers.filter(user => user.role === 'public')

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Verification</CardTitle>
          <CardDescription>Loading users...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{pendingUsers.length}</p>
                <p className="text-sm text-gray-600">Pending Journalists</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{allJournalists.length}</p>
                <p className="text-sm text-gray-600">Total Journalists</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Building className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{publicUsers.length}</p>
                <p className="text-sm text-gray-600">Public Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Journalists Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Journalist Applications</CardTitle>
          <CardDescription>
            Review and approve or reject journalist account applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p>No pending journalist applications</p>
              <p className="text-sm">All journalist applications have been reviewed</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Journalist</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="font-medium">
                        {user.firstName} {user.lastName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span className="text-sm">{user.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{user.organization}</div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                          disabled={actionLoading === user._id}
                        >
                          Review
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* All Journalists Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Journalist Accounts</CardTitle>
          <CardDescription>
            Manage all journalist accounts and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allJournalists.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No journalist accounts found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allJournalists.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.organization}</TableCell>
                    <TableCell>
                      {getStatusBadge(user.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user)
                            setVerificationNotes(user.verificationNotes || '')
                          }}
                          disabled={actionLoading === user._id}
                        >
                          Manage
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {selectedUser.status === 'pending' ? 'Review Application' : 'Manage User'}
              </CardTitle>
              <CardDescription>
                {selectedUser.firstName} {selectedUser.lastName} - {selectedUser.organization}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* User Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-lg font-semibold">{selectedUser.firstName} {selectedUser.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-lg">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-lg">{selectedUser.phone}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Organization</label>
                    <p className="text-lg font-semibold">{selectedUser.organization}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Role</label>
                    <p className="text-lg capitalize">{selectedUser.role}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Current Status</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedUser.status)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <label className="text-sm font-medium text-blue-900">Application Date</label>
                <p className="text-blue-800">
                  {new Date(selectedUser.createdAt).toLocaleDateString()} at{' '}
                  {new Date(selectedUser.createdAt).toLocaleTimeString()}
                </p>
              </div>

              {/* Verification Notes */}
              <div>
                <label htmlFor="verificationNotes" className="text-sm font-medium">
                  Verification Notes
                </label>
                <Textarea
                  id="verificationNotes"
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Add notes about this verification decision..."
                  rows={3}
                />
                <p className="text-sm text-gray-600 mt-1">
                  These notes will be recorded with the verification decision.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t">
                {selectedUser.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleVerifyUser('active')}
                      disabled={actionLoading === selectedUser._id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {actionLoading === selectedUser._id ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button
                      onClick={() => handleVerifyUser('rejected')}
                      disabled={actionLoading === selectedUser._id}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {actionLoading === selectedUser._id ? 'Rejecting...' : 'Reject'}
                    </Button>
                  </>
                )}
                {selectedUser.status === 'active' && (
                  <Button
                    onClick={() => handleVerifyUser('suspended')}
                    disabled={actionLoading === selectedUser._id}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {actionLoading === selectedUser._id ? 'Suspending...' : 'Suspend'}
                  </Button>
                )}
                {(selectedUser.status === 'rejected' || selectedUser.status === 'suspended') && (
                  <Button
                    onClick={() => handleVerifyUser('active')}
                    disabled={actionLoading === selectedUser._id}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {actionLoading === selectedUser._id ? 'Activating...' : 'Activate'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedUser(null)
                    setVerificationNotes('')
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}