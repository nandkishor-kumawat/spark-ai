"use client"
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React from 'react'
import GroupRenameButton from './group-rename-button'
import GroupDeleteButton from './group-delete-button'


const SidebarItem = ({ group }: any) => {
    const params = useParams();
    return (
        <div className={`w-full group mb-0.5 hover:bg-zinc-700 ${params.id === group.id ? 'bg-zinc-700' : ''} rounded-md flex justify-between items-center transition-all ease-linear duration-150`}>
            <Link href={`/${group.id}`} className='flex-1 px-4 py-1.5 truncate' title={group.name}>{group.name}</Link>
            <div className="mx-2 space-x-1">
                <GroupRenameButton group={group} />
                <GroupDeleteButton group_id={group.id} />
            </div>
        </div>

    )
}

export default SidebarItem