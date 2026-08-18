import AdminNotificationsForm from '@/app/components/forms/notificationForm';
import React from 'react'

type Props = {}

const AdminNotifications = (props: Props) => {
  return (
    <>
    <section className='h-full flex justify-center items-center'>
        <div className="container">
            <h1 className='h3 text-center'>Add Notifications Here</h1>
            <AdminNotificationsForm/>
        </div>
    </section>
    </>
  )
}

export default AdminNotifications;