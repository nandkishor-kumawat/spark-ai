"use server"

import prisma from "@/prisma";
import { Prisma } from "@/prisma/client";

export const getChatsByUserId = async (userId: string) => {
    return prisma.chat.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        omit: { mongo_id: true }
    })
}
export const getChatById = async (id: string) => prisma.chat.findFirst({ where: { id } })

export const getMessagesByChatId = async (chatId: string) => {
    return prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: 'asc' },
    })
}

export const saveMessages = async (messages: Prisma.MessageCreateManyInput[]) => prisma.message.createMany({ data: messages })

export const deleteChat = async (id: string) => prisma.chat.delete({ where: { id } })