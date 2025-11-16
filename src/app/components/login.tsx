"use client"
import React from 'react'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Card } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useForm } from "react-hook-form"
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from "next-auth/react"
import { toast } from "sonner" 

type Inputs = {
  email: string,
  password: string,
}

const Login = () => {
  const { register, handleSubmit, formState, reset } = useForm<Inputs>();
  const router = useRouter()
  
  const handleFormSubmit = async (data: Inputs) => {
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      }); 

      if (result?.ok) {
        toast.success("Login successful!");
        reset();
        router.push("/landing");
      } else {
        toast.error(result?.error || "Login failed");
      }

    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error?.message || "An unexpected error occurred");
    }
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
              disabled={formState.isSubmitting}
            >
              {formState.isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
            
            <Link className='text-sm mt-3 text-right block' href={'/registration'}>
              Don't have an account? <span className='underline'>Register</span>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login