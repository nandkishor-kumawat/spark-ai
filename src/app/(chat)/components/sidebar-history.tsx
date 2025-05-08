"use client"
import Link from "next/link";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { Chat } from "@/prisma/client";
import { User } from "next-auth";
import { useParams, usePathname } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontalIcon, TrashIcon } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SidebarHistoryProp {
    user: User | undefined
}


const PureChatItem = ({
    chat,
    isActive,
    onDelete,
    setOpenMobile
}: {
    chat: Chat;
    isActive: boolean;
    onDelete: (id: string) => void;
    setOpenMobile: (open: boolean) => void;
}) => {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive}>
                <Link title={chat.title} href={`/chat/${chat.id}`} onClick={() => setOpenMobile(false)} className="text-gray-400 !line-clamp-1">{chat.title}</Link>
            </SidebarMenuButton>

            <DropdownMenu modal={true}>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuAction
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mr-0.5"
                        showOnHover={!isActive}
                    >
                        <MoreHorizontalIcon />
                        <span className="sr-only">More</span>
                    </SidebarMenuAction>
                </DropdownMenuTrigger>

                <DropdownMenuContent side="bottom" align="end">

                    <DropdownMenuItem
                        className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
                        onSelect={() => onDelete(chat.id)}
                    >
                        <TrashIcon />
                        <span>Delete</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    )
}

const ChatItem = React.memo(PureChatItem, (prevProps, nextProps) => {
    if (prevProps.isActive !== nextProps.isActive) return false;
    return true;
});

export default function SidebarHistory({
    user
}: SidebarHistoryProp) {
    const { id } = useParams();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const router = useRouter();
    const { setOpenMobile } = useSidebar();
    const pathname = usePathname();

    const {
        data: history,
        isLoading,
        mutate,
    } = useSWR<Array<Chat>>(user ? '/api/history' : null, fetcher, {
        fallbackData: [],
    });

    useEffect(() => {
        mutate();
    }, [mutate, pathname]);

    const onDelete = (chatId: string) => {
        setDeleteId(chatId);
        setShowDeleteDialog(true);
    }

    const chatId = /\/chat\/([a-z0-9-]{36})/.exec(pathname)?.[1];

    const handleDelete = async () => {
        const deletePromise = fetch(`/api/chat?id=${deleteId}`, {
            method: 'DELETE',
        });

        toast.promise(deletePromise, {
            loading: 'Deleting chat...',
            success: () => {
                mutate((history) => {
                    if (history) {
                        return history.filter((h) => h.id !== id);
                    }
                });
                return 'Chat deleted successfully';
            },
            error: 'Failed to delete chat',
        });

        setShowDeleteDialog(false);
        if (deleteId === id || pathname.includes(deleteId as string)) {
            router.push('/');
        }
    };

    if (isLoading) {
        return (
            <SidebarGroup>
                <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                    Today
                </div>
                <SidebarGroupContent>
                    <div className="flex flex-col gap-4 py-2 px-2">
                        <Skeleton className="h-4 w-5/12" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-3/5" />
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }


    if (history?.length === 0) {
        return (
            <SidebarGroup className="flex-1 justify-center">
                <SidebarGroupContent>
                    <div className="px-2 h-full text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
                        Your conversations will appear here once you start chatting!
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    return (
        <>
            <SidebarGroup>
                <SidebarGroupLabel>Chats</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {history?.map((chat) => (
                            <ChatItem
                                key={chat.id}
                                chat={chat}
                                isActive={pathname === `/chat/${chat.id}`}
                                onDelete={onDelete}
                                setOpenMobile={setOpenMobile}
                            />
                        ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            chat and remove it from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )

}
