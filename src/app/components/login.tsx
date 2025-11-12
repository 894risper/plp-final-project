
"use client"
import React from 'react'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Card } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {useForm} from "react-hook-form"
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {signIn} from "next-auth/react"
import {toast} from "react-hot-toast"
type Inputs={
  email:string,
  password:string,
import React from 'react'

const Login = () => {
  return (
    <div>login</div>
  )
}
const Login = () => {
  const {register,handleSubmit,formState,reset}=useForm<Inputs>();
  const router = useRouter()
  const handleFormSubmit= async(data:Inputs) =>{
try{
const res = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false
            
            if (res?.ok) {
                toast.success("Login successful!");
                reset();
                
                    router.push("/landing"); 
                
            } else {
                toast.error(res?.error || "Login failed");
            }

}catch(error){

}
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
                     <Label htmlFor='email'>Email
                       <Input
                       id='email'
                       type='email'
                       {...register('email',{
                         required:"The email is required",
                         pattern:{
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
                   
                     <Label htmlFor='password'>Password
                       <Input 
                       id='password'
                       type='password'
                       {...register("password",{
                         required:"The password is required",
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
                   
                   <div>
                    <Button  className='bg-blue-900 w-full mt-5'
                    type='submit'
                    > Login</Button>
                   </div>
                    <Link className='text-sm mt-3 text-right block' href={'/registration'}>
                        Don't have an account? <span className='underline'>Register</span>
                    </Link>

      </form>

      </CardContent>
      </Card>
    </div>
  )
export default Login