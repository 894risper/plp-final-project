import ResetPassword from '@/app/components/reset-password'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPassword/>
    </Suspense>
  )
}

export default page