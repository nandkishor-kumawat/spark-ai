"use client"
import { initializeChats } from '@/redux/features/chatSlice';
import { store, useAppSelector } from '@/redux/store'
import React, { useEffect, useLayoutEffect, useRef } from 'react'
import Chat from './Chat';

function ChatList({ history }: { history: any[] }) {
    const chats = useAppSelector((state) => state.chat.chats);
    const ref = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        store.dispatch(initializeChats(history));
    }, [history]);

    useEffect(() => {
        ref.current!.scrollIntoView({ behavior: 'smooth' });
        ref.current!.scrollIntoView();
    }, [chats])

    return (
        <>
            {chats.length === 0 && (
                <div className="w-full h-full flex justify-center items-center">
                    <h1 className="text-3xl font-bold">No Chats Found</h1>
                </div>
            )}
            {
                chats.map((chat, i) => (
                    <Chat key={i} chat={chat} isLast={(i === chats.length - 1)} />
                ))
            }
            <div ref={ref}></div>
        </>
    )
}

export default ChatList
