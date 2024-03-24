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
import { RxExternalLink } from "react-icons/rx";
import SignoutButton from './signout-button'

const Sidebar = async () => {
  const data = await getAuthSession();

  const groups = await prisma.group.findMany({
    where: {
      user_id: data?.user.id
    },
    orderBy: {
      created_at: 'desc'
    }
  });



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
      <div className='w-full px-3 pb-2 pt-3'>
        <div className='w-full mb-1 hover:bg-zinc-700 rounded-md flex justify-between items-center transition-all ease-linear duration-150'>
          <form action={newChat} className="flex-1 px-4 py-1">
            <button type="submit" className='w-full px-2 py-1 text-left'>New Chat</button>
          </form>
          <button className='px-4 py-1.5'>
            <FaEdit />
          </button>
        </div>
      </div>

      <div className="flex-1 border-t border-t-zinc-800 flex flex-col p-2">
        {groups.map((group) => <SidebarItem key={group.id} group={group} />)}
      </div>
      <div className="w-full px-2 py-2">
        <Link href={'/vision'} className='px-4 w-full bg-red text-zinc-400 flex' target='_blank'>
          <span>Chat with images </span> <RxExternalLink />
        </Link>
      </div>
      <div className='w-full px-2 border-t border-t-zinc-800 hover:bg-zinc-700 transition-all ease-linear duration-150'>
        <div className='w-full my-1 px-2 py-2 rounded-md flex justify-between items-center'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={data?.user.image as string} />
            <AvatarFallback>{data?.user.name?.charAt(0) as string}</AvatarFallback>
          </Avatar>
          <p className='text-zinc-300'>{data?.user.name}</p>
          <SignoutButton />
        </div>
      </div>
    </div>
  )
}

export default Sidebar