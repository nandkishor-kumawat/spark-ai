"use client"
import React from 'react'
import { useRouter } from "next/navigation";
import { PlusSquare } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const NewChatButton = () => {
    const router = useRouter()
    const { setOpenMobile } = useSidebar();
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="submit"
                    size={"icon"}
                    variant="ghost"
                    className="h-6 w-6 text-gray-400 hover:text-gray-300"
                    onClick={() => {
                        setOpenMobile(false);
                        router.push('/');
                        router.refresh();
                    }}
                >
                    <PlusSquare />
                </Button>
            </TooltipTrigger>
            <TooltipContent align="end">New Chat</TooltipContent>
        </Tooltip>
    )
}

export default NewChatButton
