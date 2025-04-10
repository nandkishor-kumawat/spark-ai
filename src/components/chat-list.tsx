"use client"
import React from 'react'
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
import { ChatRequestOptions, Message } from 'ai';
import { MessagePreview, ThinkingMessage } from './message-preview';
import { useSession } from 'next-auth/react';
import equal from 'fast-deep-equal';

interface MessagesProps {
    chatId: string;
    isLoading: boolean;
    messages: Array<Message>;
    setMessages: (
        messages: Message[] | ((messages: Message[]) => Message[]),
    ) => void;
    reload: (
        chatRequestOptions?: ChatRequestOptions,
    ) => Promise<string | null | undefined>;
}


function ChatList({
    chatId,
    isLoading,
    messages,
    setMessages,
    reload,
}: MessagesProps) {

    const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();

    const { data } = useSession();

    return (
        <div
            ref={messagesContainerRef}
            className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-auto pt-4 scrollbar"
        >
            {messages.length === 0 && (
                <div className="h-full w-full flex items-center justify-center">
                    <div className="max-w-md text-center space-y-4 m-auto">
                        <h1 className="md:text-3xl text-xl">Welcome!</h1>
                        <p className="text-lg text-zinc-400"> How can I assist you today?</p>
                    </div>
                </div>
            )}

            {messages.map((message, i) => (
                <MessagePreview
                    key={message.id}
                    message={message}
                    isLoading={isLoading && messages.length - 1 === i}
                    chatId={chatId}
                    setMessages={setMessages}
                    reload={reload}
                    isReadonly={false}
                />
            ))}
            {isLoading &&
                messages.length > 0 &&
                messages[messages.length - 1].role === 'user' && <ThinkingMessage />}

            <div
                ref={messagesEndRef}
                className="shrink-0 min-w-[24px] min-h-[24px]"
            />
        </div>
    )
}


export const Messages = React.memo(ChatList, (prevProps, nextProps) => {

    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.isLoading && nextProps.isLoading) return false;
    if (prevProps.messages.length !== nextProps.messages.length) return false;
    if (!equal(prevProps.messages, nextProps.messages)) return false;

    return true;
});

