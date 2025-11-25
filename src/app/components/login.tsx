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
import { toast } from "sonner" 
import { apiFetch } from '@/lib/api';
import { signIn, getSession } from "next-auth/react";


type Inputs = {
  email: string,
  password: string,
}

const Login = () => {
  const { register, handleSubmit, formState, reset } = useForm<Inputs>();
  const router = useRouter()
  
  const handleFormSubmit = async (data: Inputs) => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("Login successful!");
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(result.user));
        
        reset();
        router.push("/landing");
      } else {
        toast.error(result.message || "Login failed");
      }
    } catch (error) {
      // Fallback to NextAuth credentials sign-in if API login fails
      try {
        const result = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false
        });

    } catch (error: unknown) {
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : "Login failed";
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
              Don&apos;t have an account? <span className='underline'>Register</span>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login

export function LoginForm({ onLogin }: { onLogin: (user: { id: string; email: string; role: 'public' | 'journalist' | 'admin' }) => void }) {
  const { register, handleSubmit, formState } = useForm<Inputs>();
  const onSubmit = async (data: Inputs) => {
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: data.email, password: data.password })
      });
      localStorage.setItem('corruption-tracker-token', res.token);
      localStorage.setItem('corruption-tracker-user', JSON.stringify(res.user));
      onLogin(res.user);
      toast.success('Logged in');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Login failed';
      toast.error(msg);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='flex justify-center mb-4'>
            <Shield className="h-12 w-12 text-blue-900" />
          </div>
          <CardTitle className='text-xl'>Sign in</CardTitle>
          <CardDescription>Access procurement analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div>
              <Label htmlFor='email2'>Email</Label>
              <Input id='email2' type='email' {...register('email', { required: 'Email is required' })} />
              {formState.errors.email && <p className='text-red-500 text-sm mt-1'>{formState.errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor='password2'>Password</Label>
              <Input id='password2' type='password' {...register('password', { required: 'Password is required' })} />
              {formState.errors.password && <p className='text-red-500 text-sm mt-1'>{formState.errors.password.message}</p>}
            </div>
            <Button className='bg-blue-900 w-full mt-2' type='submit'>Login</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}