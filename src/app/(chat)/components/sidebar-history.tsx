"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import useSWR from "swr";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";

import {
    SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
    SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuAction,
    useSidebar,
} from "@/components/ui/sidebar";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Chat } from "@/prisma/client";
import { User } from "next-auth";
import { Brain, Edit2, MoreHorizontalIcon, TrashIcon } from "lucide-react";
import { fetcher } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface SidebarHistoryProp {
    user?: User;
}

const PureChatItem = ({
    chat,
    isActive,
    onDelete,
    setOpenMobile,
    onRename,
    onSetPrompt
}: {
    chat: Chat;
    isActive: boolean;
    onDelete: (id: string) => void;
    setOpenMobile: (open: boolean) => void;
    onRename: (id: string, title: string) => void;
    onSetPrompt: (id: string, prompt: string) => void;
}) => {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive}>
                <Link
                    title={chat.title}
                    href={`/chat/${chat.id}`}
                    onClick={() => setOpenMobile(false)}
                    className="text-gray-400 !line-clamp-1"
                >
                    {chat.title}
                </Link>
            </SidebarMenuButton>

            <DropdownMenu modal>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mr-0.5">
                        <MoreHorizontalIcon />
                        <span className="sr-only">More</span>
                    </SidebarMenuAction>
                </DropdownMenuTrigger>

                <DropdownMenuContent side="bottom" align="end">
                    <DropdownMenuItem onSelect={() => onRename(chat.id, chat.title)}>
                        <Edit2 />
                        <span>Rename</span>
                    </DropdownMenuItem>

                    {/* <DropdownMenuItem onSelect={() => onSetPrompt(chat.id, chat.systemPrompt || "")}>
                        <Brain />
                        <span>Set System Prompt</span>
                    </DropdownMenuItem> */}

                    <DropdownMenuItem onSelect={() => onDelete(chat.id)} className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500">
                        <TrashIcon />
                        <span>Delete</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    );
}

const ChatItem = React.memo(PureChatItem, (prev, next) => {
    if (prev.chat.title !== next.chat.title) return false;
    return prev.isActive === next.isActive;
})

export default function SidebarHistory({ user }: SidebarHistoryProp) {
    const { setOpenMobile } = useSidebar();
    const { id: currentId } = useParams();
    const pathname = usePathname();
    const router = useRouter();

    const { data: history = [], isLoading, mutate } = useSWR<Chat[]>(
        user ? '/api/history' : null,
        fetcher,
        { fallbackData: [] }
    );

    useEffect(() => {
        mutate();
    }, [mutate, pathname]);

    const chatId = useMemo(() => /\/chat\/([a-z0-9-]{36})/.exec(pathname)?.[1], [pathname]);

    // Modal States
    const [modals, setModals] = useState<{
        deleteId?: string;
        renameId?: string;
        promptId?: string;
    }>({});

    const [renameValue, setRenameValue] = useState("");
    const [systemPrompt, setSystemPrompt] = useState("");

    const onDelete = useCallback((id: string) => {
        setModals({ deleteId: id });
    }, []);

    const handleDelete = async () => {
        const { deleteId } = modals;
        if (!deleteId) return;

        toast.promise(
            fetch(`/api/chat?id=${deleteId}`, { method: 'DELETE' }),
            {
                loading: 'Deleting chat...',
                success: () => {
                    mutate(prev => prev?.filter(chat => chat.id !== deleteId));
                    if (pathname.includes(deleteId)) router.push('/');
                    return 'Chat deleted successfully';
                },
                error: 'Failed to delete chat',
            }
        );

        setModals({});
    };

    const onRename = useCallback((id: string, title: string) => {
        setModals({ renameId: id });
        setRenameValue(title);
    }, []);

    const handleRename = async (e: React.MouseEvent<HTMLButtonElement>) => {
        const { renameId } = modals;
        if (!renameId) return;

        toast.promise(
            fetch('/api/chat/rename', {
                method: 'PATCH',
                body: JSON.stringify({ id: renameId, title: renameValue }),
            }),
            {
                loading: 'Renaming chat...',
                success: () => {
                    mutate(prev => prev?.map(chat => chat.id === renameId ? ({ ...chat, title: renameValue }) : chat));
                    setModals({});
                    setRenameValue("");
                    return 'Chat renamed successfully';
                },
                error: 'Failed to rename chat',
            }
        );
    }

    const onSetPrompt = useCallback((id: string, prompt: string) => {
        setModals({ promptId: id });
        setSystemPrompt(prompt);
    }, []);

    const handleSetPrompt = async () => {
        const { promptId } = modals;
        if (!promptId) return;

        const res = await fetch('/api/chat/system-prompt', {
            method: 'PATCH',
            body: JSON.stringify({ id: promptId, systemPrompt }),
        });

        if (res.ok) {
            toast.success("System prompt updated");
            mutate();
        } else {
            toast.error("Failed to update prompt");
        }

        setModals({});
    };

    // Loading & Empty States
    if (isLoading) {
        return (
            <SidebarGroup>
                <div className="px-2 py-1 text-xs text-sidebar-foreground/50">Today</div>
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

    if (history.length === 0) {
        return (
            <SidebarGroup className="flex-1 justify-center">
                <SidebarGroupContent>
                    <div className="px-2 h-full text-zinc-500 flex justify-center items-center text-sm">
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
                        {history.map(chat => (
                            <ChatItem
                                key={chat.id}
                                chat={chat}
                                // isActive={chat.id === chatId}
                                isActive={pathname === `/chat/${chat.id}`}
                                onDelete={onDelete}
                                onRename={onRename}
                                onSetPrompt={onSetPrompt}
                                setOpenMobile={setOpenMobile}
                            />
                        ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>

            {/* Delete Dialog */}
            <AlertDialog open={!!modals.deleteId} onOpenChange={() => setModals({})}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your chat.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Rename Dialog */}
            <AlertDialog open={!!modals.renameId} onOpenChange={() => setModals({})}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Rename Chat</AlertDialogTitle>
                        <AlertDialogDescription />
                    </AlertDialogHeader>
                    <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} />
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRename} disabled={!renameValue}>Save</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* System Prompt Dialog */}
            <AlertDialog open={!!modals.promptId} onOpenChange={() => setModals({})}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Set System Prompt</AlertDialogTitle>
                        <AlertDialogDescription />
                    </AlertDialogHeader>
                    <Textarea
                        className="w-full border rounded p-2"
                        rows={5}
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                    />
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSetPrompt} disabled={!systemPrompt}>Save</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
