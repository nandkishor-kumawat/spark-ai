import React from 'react'
import { getAuthSession } from '../api/auth/[...nextauth]/options'
import { Button } from '@/components/ui/button'
import { addGroupData } from '@/actions'
import { RedirectType, redirect } from 'next/navigation'

const Page = async () => {
  const session = await getAuthSession();

  const newChat = async () => {
    "use server"
    const group = await addGroupData({
      name: "New Chat",
      user_id: session?.user.id as string,
    })
    redirect(`/${group.id}`, RedirectType.replace);
  }

  return (
    <div className="w-full h-full flex justify-center items-center">
      <form action={newChat} className="px-4 py-1.5" style={{
        marginTop: '50%',
        transform: 'translateY(-50%)'
      }}>
        <Button type="submit" className='w-full px-3 py-1.5 text-left'>New Chat</Button>
      </form>
    </div>
  )
}

export default Page