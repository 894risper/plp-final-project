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
import { toast } from "sonner"
import JournalistRegistration from './JournalistRegistration';
import { apiFetch } from '@/lib/api';

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
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          role: 'public',
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone
        })
      });
      if (res?.token) {
        localStorage.setItem('corruption-tracker-token', res.token);
        localStorage.setItem('corruption-tracker-user', JSON.stringify(res.user));
      }
      toast.success("Registration successful!");
      reset();
      router.push('/login');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed. Please try again.";
      toast.error(errorMessage);
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  }

  // If journalist form is shown, render that instead
  if (showJournalistForm) {
    return (
      <JournalistRegistration 
        onSuccess={() => setShowJournalistForm(false)}
        showBackButton={true}
      />
    );
  }

  return (
    <div className='min-h-screen bg-gray-300 flex items-center justify-center px-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='flex justify-center mb-4'>
            <Shield className="h-12 w-12 text-blue-900 "></Shield>
          </div>
          <CardTitle className='text-2xl'>Corruption Tracker</CardTitle>
          <CardDescription>
            Government Procurement Transparency Platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
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
                <p className='text-red-500'>
                  {formState.errors.firstName.message}
                </p>
              }
            </div>
            <div>
              <Label htmlFor='lastName'>Last Name
                <Input
                  id='lastName'
                  type='text'
                  {...register('lastName', {
                    required: "The last name is required",
                    pattern: {
                      value: /^[a-zA-Z]+$/,
                      message: "Username should only contain letters"
                    }
                  })}
                />
                {formState.errors.lastName &&
                  <p className='text-red-500'>
                    {formState.errors.lastName.message}
                  </p>
                }
              </Label>
            </div>
            <div>
              <Label htmlFor='phone'>Phone
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
                      message: "Phone number should not contain less than 10 numbers"
                    },
                    maxLength: {
                      value: 10,
                      message: "Phone number should not contain more than 10 numbers"
                    }
                  })}
                />
                {formState.errors.phone &&
                  <p className='text-red-500'>
                    {formState.errors.phone.message}
                  </p>
                }
              </Label>
            </div>
            <div>
              <Label htmlFor='email'>Email
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
                  <p className='text-red-500'>
                    {formState.errors.email.message}
                  </p>
                }
              </Label>
            </div>
            <div>
              <Label htmlFor='password'>Password
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
                  <p className='text-red-500'>
                    {formState.errors.password.message}
                  </p>
                }
              </Label>
            </div>
            <div className='flex justify-center '>
              <Button className='bg-blue-900 mt-5 flex w-full '
                type='submit'
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </div>

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