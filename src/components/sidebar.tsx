import prisma from '@/prisma'
import Link from 'next/link'
import React from 'react'
import { FaEdit } from 'react-icons/fa'
import SidebarItem from './sidebar-item'
import { addGroupData } from '@/actions'
import { getAuthSession } from '@/app/api/auth/[...nextauth]/options'
import { RedirectType, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { MdLogout } from 'react-icons/md'

const Sidebar = async () => {
  const groups = await prisma.groups.findMany({
    orderBy: {
      created_at: 'desc'
    }
  })
  const data = await getAuthSession();

  const newChat = async () => {
    "use server"
    const group = await addGroupData({
      name: "New Chat",
      user_id: data?.user.id as string,
    })
    revalidatePath(`/${group.id}`)
    redirect(`/${group.id}`, RedirectType.replace);
  }

  return (
    <div className='w-full flex flex-col h-full'>
      <div className='w-full px-3'>
        <div className='w-full mt-3 mb-1 hover:bg-zinc-700 rounded-md flex justify-between items-center transition-all ease-linear duration-150'>
          <form action={newChat} className="flex-1 px-4 py-1.5">
            <button type="submit" className='w-full px-2 py-1.5 text-left'>New Chat</button>
          </form>
          <button className='px-4 py-1.5'>
            <FaEdit />
          </button>
        </div>
      </div>

      <div className="flex-1 border-t border-t-zinc-600 flex flex-col my-2 p-2">
        {
          groups.map((group) => <SidebarItem key={group.id} group={group} />)
        }
      </div>

      <div className='w-full px-2'>
        <div className='w-full my-3 p-2 hover:bg-zinc-700 rounded-md flex justify-between items-center transition-all ease-linear duration-150'>
          <Avatar>
            <AvatarImage src={data?.user.image as string} />
            <AvatarFallback>{data?.user.name?.charAt(0) as string}</AvatarFallback>
          </Avatar>
          <p>{data?.user.name}</p>
          <Link href={'/api/auth/signout'} className='p-2 hover:bg-zinc-900 transition-all ease-linear duration-150 rounded-md'>
            <MdLogout />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Sidebar