import DashboardPage from '@/components/DashboardPage'
import React from 'react'

const page = () => {
  const role="employer";
  return (
     <div>
          <DashboardPage role={role} />
        </div>
  )
}

export default page