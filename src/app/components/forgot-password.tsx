"use client"
import React from 'react'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Card } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useForm } from "react-hook-form"
import Link from 'next/link';
import { toast } from "sonner" 

type Inputs = {
  email: string,
}

const ForgotPassword = () => {
  const { register, handleSubmit, formState, reset } = useForm<Inputs>();
  
  const handleFormSubmit = async (data: Inputs) => {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("Password reset link sent to your email!");
        reset();
      } else {
        toast.error(result.message || "Failed to send password reset link");
      }

    } catch (error: unknown) {
      console.error("Forgot password error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage);
    }
  }
  
  return (
    <div className='min-h-screen bg-gray-300 flex items-center justify-center px-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='flex justify-center mb-4'>
            <Shield className="h-12 w-12 text-blue-900" />
          </div>
          <CardTitle className='text-2xl'>Forgot Password</CardTitle>
          <CardDescription>
            Enter your email to receive a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
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
            
            <Button  
              className='bg-blue-900 w-full mt-5'
              type='submit'
              disabled={formState.isSubmitting}
            >
              {formState.isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </Button>
            
            <Link className='text-sm mt-3 text-right block' href={'/login'}>
              Remember your password? <span className='underline'>Login</span>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ForgotPassword