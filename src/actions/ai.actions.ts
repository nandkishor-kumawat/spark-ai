"use server"

import prisma from "@/prisma";

export const getChatsByUserId = async (userId: string) => {
    const chats = await prisma.chat.findMany({
        where: {
            userId
        },
        orderBy: {
            createdAt: 'desc'
        },
    })

    return chats;
}
export const getChatById = async (id: string) => {
    const chat = await prisma.chat.findFirst({ where: { id } })
    return chat;
}

export const getMessagesByChatId = async (chatId: string) => {
    const messages = await prisma.message.findMany({
        where: {
            chatId
        },
        orderBy: {
            createdAt: 'asc'
        },
    })
    return messages;
}