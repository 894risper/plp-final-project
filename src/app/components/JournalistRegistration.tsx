"use client"
import React, { useState } from 'react'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Card } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useForm } from "react-hook-form"
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from "sonner"  // Changed from react-hot-toast

type Inputs = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  organization: string;
}

interface JournalistRegistrationProps {
  onSuccess?: () => void;
  showBackButton?: boolean;
}

export default function JournalistRegistration({ 
  onSuccess, 
  showBackButton = true 
}: JournalistRegistrationProps) {
  const { register, handleSubmit, formState } = useForm<Inputs>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFormSubmit = async (data: Inputs) => {
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          role: 'journalist'
        })
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || "Registration failed");
      }

      toast.success("Journalist account created! Awaiting admin approval.");
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/login');
      }
      
    } catch (error: unknown) {
      console.error("Journalist registration error:", error);
      const errorMessage = error instanceof Error ? error.message : "Registration failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='flex justify-center mb-4'>
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className='text-2xl'>Journalist Sign Up</CardTitle>
          <CardDescription>
            Apply for journalist access (requires admin approval)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor='firstName'>First Name *</Label>
                <Input
                  id='firstName'
                  type="text"
                  {...register('firstName', { 
                    required: "First name is required",
                    pattern: {
                      value: /^[a-zA-Z]+$/,
                      message: "First name should only contain letters"
                    }
                  })}
                />
                {formState.errors.firstName && 
                  <p className='text-red-500 text-sm mt-1'>{formState.errors.firstName.message}</p>
                }
              </div>

              <div>
                <Label htmlFor='lastName'>Last Name *</Label>
                <Input
                  id='lastName'
                  type='text'
                  {...register('lastName', { 
                    required: "Last name is required",
                    pattern: {
                      value: /^[a-zA-Z]+$/,
                      message: "Last name should only contain letters"
                    }
                  })}
                />
                {formState.errors.lastName && 
                  <p className='text-red-500 text-sm mt-1'>{formState.errors.lastName.message}</p>
                }
              </div>
            </div>

            <div>
              <Label htmlFor='organization'>Media Organization *</Label>
              <Input
                id='organization'
                type='text'
                {...register('organization', { 
                  required: "Organization is required for journalist accounts" 
                })}
                placeholder="e.g., CNN, BBC, New York Times"
              />
              {formState.errors.organization && 
                <p className='text-red-500 text-sm mt-1'>{formState.errors.organization.message}</p>
              }
            </div>

            <div>
              <Label htmlFor='email'>Email *</Label>
              <Input
                id='email'
                type='email'
                {...register('email', { 
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Invalid email format"
                  }
                })}
              />
              {formState.errors.email && 
                <p className='text-red-500 text-sm mt-1'>{formState.errors.email.message}</p>
              }
            </div>

            <div>
              <Label htmlFor='phone'>Phone *</Label>
              <Input
                id='phone'
                type='number'
                {...register("phone", { 
                  required: "Phone is required",
                  minLength: {
                    value: 10,
                    message: "Phone number should be 10 digits"
                  },
                  maxLength: {
                    value: 10,
                    message: "Phone number should be 10 digits"
                  }
                })}
              />
              {formState.errors.phone &&
                <p className='text-red-500 text-sm mt-1'>{formState.errors.phone.message}</p>
              }
            </div>

            <div>
              <Label htmlFor='password'>Password *</Label>
              <Input 
                id='password'
                type='password'
                {...register("password", { 
                  required: "Password is required",
                  minLength: { 
                    value: 8, 
                    message: "Password should contain at least 8 characters" 
                  }
                })}
              />
              {formState.errors.password &&
                <p className='text-red-500 text-sm mt-1'>{formState.errors.password.message}</p>
              }
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 text-sm text-center">
                ⚠️ Your journalist account will require admin approval before you can access enhanced features.
                You will be notified via email once approved.
              </p>
            </div>
            
            <Button 
              className='w-full bg-blue-600 hover:bg-blue-700' 
              type='submit'
              disabled={loading}
            >
              {loading ? 'Submitting Application...' : 'Apply for Journalist Access'}
            </Button>

            {showBackButton && (
              <div className="text-center pt-4 border-t">
                <Link 
                  className='text-sm text-blue-600 hover:underline' 
                  href={'/registration'}
                >
                  ← Back to regular registration
                </Link>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}