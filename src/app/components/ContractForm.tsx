"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, X } from 'lucide-react'

interface ContractFormProps {
  onSuccess?: () => void
}

export function ContractForm({ onSuccess }: ContractFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    contract_id: '',
    title: '',
    vendor_name: '',
    ministry: '',
    value: '',
    date_awarded: '',
    category: '',
    description: '',
    anomaly_flags: [] as string[]
  })

  const [newFlag, setNewFlag] = useState('')

  const ministries = [
    'Ministry of Health',
    'Ministry of Defense',
    'Ministry of Education',
    'Ministry of Transport',
    'Ministry of Infrastructure',
    'Ministry of Interior'
  ]

  const categories = [
    'Medical Equipment',
    'IT Services',
    'Infrastructure',
    'Security Systems',
    'Pharmaceuticals',
    'Consulting',
    'Educational Supplies'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          value: parseFloat(formData.value),
          date_awarded: new Date(formData.date_awarded)
        }),
      })

      if (response.ok) {
        toast.success('Contract added successfully')
        setFormData({
          contract_id: '',
          title: '',
          vendor_name: '',
          ministry: '',
          value: '',
          date_awarded: '',
          category: '',
          description: '',
          anomaly_flags: []
        })
        onSuccess?.()
      } else {
        throw new Error('Failed to add contract')
      }
    } catch (error) {
      toast.error('Failed to add contract')
    } finally {
      setLoading(false)
    }
  }

  const addFlag = () => {
    if (newFlag.trim() && !formData.anomaly_flags.includes(newFlag.trim())) {
      setFormData(prev => ({
        ...prev,
        anomaly_flags: [...prev.anomaly_flags, newFlag.trim()]
      }))
      setNewFlag('')
    }
  }

  const removeFlag = (flag: string) => {
    setFormData(prev => ({
      ...prev,
      anomaly_flags: prev.anomaly_flags.filter(f => f !== flag)
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Contract</CardTitle>
        <CardDescription>
          Enter government contract details (Admin Only)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contract_id">Contract ID *</Label>
              <Input
                id="contract_id"
                value={formData.contract_id}
                onChange={(e) => setFormData(prev => ({ ...prev, contract_id: e.target.value }))}
                placeholder="CT-2024-001"
                required
              />
            </div>

            <div>
              <Label htmlFor="title">Contract Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Medical Equipment Procurement"
                required
              />
            </div>

            <div>
              <Label htmlFor="vendor_name">Vendor Name *</Label>
              <Input
                id="vendor_name"
                value={formData.vendor_name}
                onChange={(e) => setFormData(prev => ({ ...prev, vendor_name: e.target.value }))}
                placeholder="MedSupply Corp"
                required
              />
            </div>

            <div>
              <Label htmlFor="ministry">Ministry *</Label>
              <Select value={formData.ministry} onValueChange={(value) => setFormData(prev => ({ ...prev, ministry: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ministry" />
                </SelectTrigger>
                <SelectContent>
                  {ministries.map(ministry => (
                    <SelectItem key={ministry} value={ministry}>{ministry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="value">Contract Value (USD) *</Label>
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                placeholder="1000000"
                required
              />
            </div>

            <div>
              <Label htmlFor="date_awarded">Date Awarded *</Label>
              <Input
                id="date_awarded"
                type="date"
                value={formData.date_awarded}
                onChange={(e) => setFormData(prev => ({ ...prev, date_awarded: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of the contract..."
              rows={3}
            />
          </div>

          <div>
            <Label>Anomaly Flags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newFlag}
                onChange={(e) => setNewFlag(e.target.value)}
                placeholder="Add anomaly flag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFlag())}
              />
              <Button type="button" onClick={addFlag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.anomaly_flags.map(flag => (
                <div key={flag} className="flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                  {flag}
                  <button type="button" onClick={() => removeFlag(flag)}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Adding Contract...' : 'Add Contract'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}