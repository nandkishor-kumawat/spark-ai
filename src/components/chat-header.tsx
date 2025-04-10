"use client"
import React from 'react'
import { SidebarTrigger, useSidebar } from './ui/sidebar';
import NewChatButton from './new-chat-button';
import { MdEnergySavingsLeaf, MdLight, MdThunderstorm } from 'react-icons/md';

const ChatHeader = () => {
    const { isMobile, open } = useSidebar();
    const shouldRender = !(open && !isMobile);
    return (
        <div className="border-b border-b-zinc-800 w-full h-10 flex items-center sticky top-0 bg-background p-2 gap-2">
            {
                shouldRender && (
                    <div className='flex items-center gap-2'>
                        <SidebarTrigger className="text-gray-400 hover:text-gray-300" />
                        <NewChatButton />
                    </div>
                )
            }
            <div className="flex-1 flex items-center justify-center">
                <span>Spark AI</span>
            </div>
        </div>
    )
}

export default ChatHeader