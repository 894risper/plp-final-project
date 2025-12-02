"use client"
import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Card } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useForm } from "react-hook-form"
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from "sonner" 

type Inputs = {
  password: string,
  confirmPassword: string,
}

const ResetPassword = () => {
  const { register, handleSubmit, formState, reset } = useForm<Inputs>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setToken(token);
    }
  }, [searchParams]);

  const handleFormSubmit = async (data: Inputs) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!token) {
      toast.error("Invalid or missing reset token");
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: data.password, token })
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Password has been reset successfully!");
        reset();
        router.push("/login");
      } else {
        toast.error(result.message || "Failed to reset password");
      }
    } catch (error: unknown) {
      console.error("Reset password error:", error);
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
          <CardTitle className='text-2xl'>Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
            <div>
              <Label htmlFor='password'>New Password</Label>
              <Input
                id='password'
                type='password'
                {...register('password', {
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
            <div>
              <Label htmlFor='confirmPassword'>Confirm New Password</Label>
              <Input
                id='confirmPassword'
                type='password'
                {...register('confirmPassword', {
                  required: "Please confirm your password",
                })}
              />
              {formState.errors.confirmPassword &&
                <p className='text-red-500 text-sm mt-1'>
                  {formState.errors.confirmPassword.message}
                </p>
              }
            </div>
            <Button
              className='bg-blue-900 w-full mt-5'
              type='submit'
              disabled={formState.isSubmitting}
            >
              {formState.isSubmitting ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ResetPassword;