"use server"
import { getAuthSession } from "@/app/api/auth/[...nextauth]/options";
import { Chat } from "@/lib/types";
import prisma from "@/prisma";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory, InlineDataPart } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const addGroupData = async (data: any) => {
    const group = await prisma.groups.create({
        data
    })
    return group
}

export const addChatData = async (data: any) => {
    return await prisma.chats.create({
        data
    })
}

export const deleteGroupChat = async (id: string) => {
    await prisma.$transaction([
        prisma.chats.deleteMany({
            where: {
                group_id: id
            }
        }),
        prisma.groups.delete({
            where: {
                id
            }
        })
    ])

    revalidatePath('/', 'page');

}

export const sendMessage = async ({ prompt, group_id }: { prompt: string, group_id: string }) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const session = await getAuthSession()
    const user_id = session?.user?.id as string;
    if (!user_id) return console.log('User not found');
    if (!group_id) return console.log('group_id not found');

    const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
    };

    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ];

    const allHistory = await prisma.chats.findMany({
        where: {
            user_id: session?.user?.id,
            group_id
        },
        orderBy: {
            created_at: 'asc'
        }
    })

    allHistory.pop();
    const history = allHistory.map((chat) => ({
        role: chat.role,
        parts: [{ text: chat.message }]
    }));

    const chat = model.startChat({
        history: history,
        generationConfig,
        // safetySettings
    });

    try {
        const result = await chat.sendMessage(prompt);
        const response = result.response;
        const text = response.text();
        console.log(text)
        return await prisma.chats.create({
            data: {
                user_id,
                group_id,
                message: text,
                role: 'model',
                model: 'gemini-pro'
            }
        })
    } catch (error) {
        console.log(error)
        return await prisma.chats.create({
            data: {
                user_id,
                group_id,
                message: 'Error while generating response',
                role: 'model',
                model: 'gemini-pro'
            }
        })
    }
}


export const genrateVisionProContent = async (prompt: string, imageParts: InlineDataPart[], group_id: string) => {

    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    const session = await getAuthSession()
    const user_id = session?.user?.id as string;

    try {
        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();
        console.log(text);

        return await prisma.chats.create({
            data: {
                user_id,
                group_id,
                message: text,
                role: 'model',
                model: 'gemini-pro-vision',
                images: imageParts
            }
        })
    } catch (error) {
        console.log(error);
        return await prisma.chats.create({
            data: {
                user_id,
                group_id,
                message: 'Error while generating response',
                role: 'model',
                model: 'gemini-pro-vision'
            }
        })
    }
}

