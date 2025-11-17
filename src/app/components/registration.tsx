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
import { signIn } from 'next-auth/react'
import { toast } from "sonner"
import JournalistRegistration from '../components/JournalistRegistration';

type Inputs = {
  firstName: string;
  email: string;
  lastName: string;
  phone: string;
  password: string;
}

const Register = () => {
  const { register, handleSubmit, formState, reset } = useForm<Inputs>();
  const [loading, setLoading] = useState(false);
  const [showJournalistForm, setShowJournalistForm] = useState(false);
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
          role: 'public' // Explicitly set role
        })
      });
      
      // Safely parse response: prefer JSON, but handle unexpected HTML/text error pages
      let result: any = null;
      let rawText: string | null = null;
      try {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          result = await res.json();
        } else {
          rawText = await res.text();
        }
      } catch (parseErr) {
        // Ignore parse errors; we'll handle based on status
      }

      if (!res.ok) {
        const message = result?.error || result?.message || rawText || `Failed to register user (status ${res.status})`;
        throw new Error(message);
      }

      const successMessage = result?.message || rawText || "Registration successful!";
      toast.success(successMessage);
      reset();

      // Automatically sign the user in and go to landing
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      });

      if (signInResult?.ok) {
        router.push('/landing');
      } else {
        toast.message("Account created. Please log in.");
        router.push('/login');
      }

    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  }

  // If journalist form is shown, render that instead
  if (showJournalistForm) {
    return (
      <JournalistRegistration 
        onSuccess={() => {
          setShowJournalistForm(false);
          router.push('/login');
        }}
        showBackButton={true}
      />
    );
  }

  return (
    <div className='min-h-screen bg-gray-300 flex items-center justify-center px-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='flex justify-center mb-4'>
            <Shield className="h-12 w-12 text-blue-900" />
          </div>
          <CardTitle className='text-2xl'>Corruption Tracker</CardTitle>
          <CardDescription>
            Government Procurement Transparency Platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
              <Label htmlFor='firstName'>First Name</Label>
              <Input
                id='firstName'
                type="text"
                {...register('firstName', {
                  required: "The first name is required",
                  pattern: {
                    value: /^[a-zA-Z]+$/,
                    message: "First name should only contain letters"
                  }
                })}
              />
              {formState.errors.firstName &&
                <p className='text-red-500 text-sm mt-1'>
                  {formState.errors.firstName.message}
                </p>
              }
            </div>
            
            <div>
              <Label htmlFor='lastName'>Last Name</Label>
              <Input
                id='lastName'
                type='text'
                {...register('lastName', {
                  required: "The last name is required",
                  pattern: {
                    value: /^[a-zA-Z]+$/,
                    message: "Last name should only contain letters"
                  }
                })}
              />
              {formState.errors.lastName &&
                <p className='text-red-500 text-sm mt-1'>
                  {formState.errors.lastName.message}
                </p>
              }
            </div>
            
            <div>
              <Label htmlFor='phone'>Phone</Label>
              <Input
                id='phone'
                type='number'
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]/,
                    message: "Phone number should only contain numbers"
                  },
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
                <p className='text-red-500 text-sm mt-1'>
                  {formState.errors.phone.message}
                </p>
              }
            </div>
            
            <div>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                {...register('email', {
                  required: "The email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Invalid email format"
                  }
                })}
              />
              {formState.errors.email &&
                <p className='text-red-500 text-sm mt-1'>
                  {formState.errors.email.message}
                </p>
              }
            </div>
            
            <div>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                type='password'
                {...register("password", {
                  required: "The password is required",
                  minLength: {
                    value: 8,
                    message: "Password should contain at least 8 characters"
                  }
                })}
              />
              {formState.errors.password &&
                <p className='text-red-500 text-sm mt-1'>
                  {formState.errors.password.message}
                </p>
              }
            </div>
            
            <Button 
              className='bg-blue-900 w-full mt-5'
              type='submit'
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register as Public User'}
            </Button>

            {/* Journalist Registration Option */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-blue-800 text-sm mb-2">Are you a journalist?</p>
              <button
                type="button"
                onClick={() => setShowJournalistForm(true)}
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                Register as journalist for enhanced access
              </button>
            </div>

            <Link className='text-sm mt-3 text-right block' href={'/login'}>
              Already have an account? <span className='underline'>Login</span>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Register