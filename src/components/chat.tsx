"use client"
import React from 'react'
import ChatHeader from './chat-header'
import ChatForm from './chat-form';
import { Message, useChat } from '@ai-sdk/react';
import { Messages } from './chat-list';
import { useSWRConfig } from 'swr';
import { toast } from 'sonner';

const Chat = ({
    id,
    initialMessages,
}: {
    id: string;
    initialMessages: Message[];
}) => {
    const { mutate } = useSWRConfig();
    const { messages, handleSubmit, input, setInput, isLoading, stop, setMessages, reload } = useChat({
        id,
        body: { chatId: id },
        initialMessages,
        onFinish: () => {
            mutate('/api/history');
        },
        onError: (error) => {
            toast.error('An error occured, please try again!');
        },
    });

    return (
        <>
            <div className="flex flex-col min-w-0 h-dvh bg-background">
                <ChatHeader />

                <Messages
                    chatId={id}
                    messages={messages}
                    isLoading={isLoading}
                    setMessages={setMessages}
                    reload={reload}
                />


                <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
                    <ChatForm
                        chatId={id}
                        input={input}
                        setInput={setInput}
                        isLoading={isLoading}
                        stop={stop}
                        handleSubmit={handleSubmit}
                    />

                </form>
            </div>
        </>
    )
}

export default Chat
