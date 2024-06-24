import ChatSkeleton from '@/components/chat-skeleton'
import React from 'react'

export default function loading() {
    return (
        <div className="w-full h-full flex flex-col items-center gap-2 overflow-hidden">
            <div className="flex flex-1 w-full overflow-auto scrollbar">
                <div className="flex flex-1 w-full p-2">
                    <div className="flex flex-col pb-9 text-sm w-full">
                        <ChatSkeleton />
                        <ChatSkeleton />
                    </div>
                </div>
            </div>
        </div>
    )
}
