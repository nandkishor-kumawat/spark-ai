import { auth } from '@/auth';
import Chat from '@/app/(chat)/components/chat'
import prisma from '@/prisma';
import { notFound } from 'next/navigation';
import React from 'react'

const Page = async ({
    params,
}: {
    params: Promise<{ id: string }>
}) => {
    const { id } = await params;

    const chat = await prisma.chat.findFirst({
        where: { id },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
    })

    if (!chat) notFound();

    const session = await auth()

    if (chat.visibility === 'private' && (!session?.user || chat.userId !== session.user.id)) {
        notFound();
    }
    const initialMessages = chat.messages.map((message) => ({
        id: message.id,
        content: message.content,
        role: message.role as 'user' | 'assistant',
        createdAt: message.createdAt,
        experimental_attachments: message.attachments
    }))

    return (
        <>
            <Chat
                key={id}
                id={id}
                initialMessages={initialMessages}
            />
        </>
    )
}

export default Page
