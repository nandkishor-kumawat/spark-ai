"use server"
import { getAuthSession } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/prisma";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory, InlineDataPart, InputContent } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const addGroupData = async (data: any) => {
    return await prisma.group.create({ data })
}

export const addChatData = async (data: any) => {
    return await prisma.query.create({ data })
}

export const deleteGroupChat = async (id: string) => {
    await prisma.$transaction([
        prisma.query.deleteMany({ where: { group_id: id } }),
        prisma.group.delete({ where: { id } })
    ])

    revalidatePath('/', 'page');
}

export const sendMessage = async ({ prompt, group_id, chat_id }: { prompt: string, group_id: string, chat_id: string }) => {
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

    const allHistory = await prisma.query.findMany({
        where: {
            user_id: session?.user?.id,
            group_id
        },
        orderBy: {
            created_at: 'asc'
        }
    })

    const history = allHistory.flatMap(curr => [
        { role: 'user', parts: [{ text: curr.message }] },
        { role: 'model', parts: [{ text: curr.response }] }
    ]) as InputContent[];

    history.pop();
    history.pop();

    const chat = model.startChat({
        history: history,
        generationConfig,
        // safetySettings
    });

    try {
        const result = await chat.sendMessage(prompt);
        const response = result.response;
        const text = response.text();

        return await prisma.query.update({
            where: { id: chat_id },
            data: { response: text }
        })
    } catch (error) {
        console.log(error)
        return await prisma.query.update({
            where: { id: chat_id },
            data: { response: 'Error while generating response' }
        })
    }
}


export const genrateVisionProContent = async (prompt: string, imageParts: InlineDataPart[], chat_id: string) => {

    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    const session = await getAuthSession()
    const user_id = session?.user?.id as string;

    try {
        const result = await model.generateContent([prompt, ...imageParts]);
        const response = result.response;
        const text = response.text();

        const images = imageParts.map((image) => ({ ...image.inlineData }))

        return await prisma.query.update({
            where: { id: chat_id },
            data: { response: text }
        })

    } catch (error) {
        console.log(error);
        return await prisma.query.update({
            where: { id: chat_id },
            data: { response: 'Error while generating response' }
        })
    }
}

