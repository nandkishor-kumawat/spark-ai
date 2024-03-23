
"use client"
import React, { useTransition } from 'react'
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
import { useParams, useRouter } from 'next/navigation';
import { deleteGroupChat } from '@/actions';
import { toast } from 'sonner';

export default function GroupDeleteButton({ group_id }: { group_id: string }) {

    const params = useParams();
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const deleteGroup = async () => {
        startTransition(async () => {
            const a = await deleteGroupChat(group_id);
            toast.success("Chat deleted successfully", {
                style: {
                    color: 'green',
                },
                position: 'top-center',
                duration: 3000
            });
            if (params.id === group_id) router.replace('/');
        })
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger className='group-hover:visible invisible px-1 py-1.5'>
                <MdDeleteForever className='hover:text-red-500 text-zinc-400' />
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
                    <AlertDialogAction onClick={deleteGroup}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
