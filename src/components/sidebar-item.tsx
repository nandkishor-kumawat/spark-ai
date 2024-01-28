"use client"
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import React, { useTransition } from 'react'
import { toast } from "sonner"
import { MdDeleteForever } from 'react-icons/md'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteGroupChat } from '@/actions'


const SidebarItem = ({ group }: any) => {
    const params = useParams();
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const deleteChat = async () => {
        startTransition(async () => {
            const a = await deleteGroupChat(group.id);
            console.log(a)

            toast.success("Chat deleted successfully", {
                style: {
                    color: 'green',
                },
                position: 'top-center',
                duration: 3000
            });
            if (params.id === group.id) router.replace('/');
        })
    }
    return (
        <div className={`w-full group mb-0.5 hover:bg-zinc-700 ${params.id === group.id ? 'bg-zinc-700' : ''} rounded-md flex justify-between items-center transition-all ease-linear duration-150`}>
            <Link href={`/${group.id}`} className='flex-1 px-4 py-1.5'>{group.name}</Link>

            <AlertDialog>
                <AlertDialogTrigger className='group-hover:visible invisible px-4 py-1.5'>
                    <MdDeleteForever className='hover:text-red-500' />
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your all chats from this group.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteChat}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>

    )
}

export default SidebarItem