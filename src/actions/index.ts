"use server"
import { getAuthSession } from "@/app/api/auth/[...nextauth]/options";
import { QueryType } from "@/lib/types";
import prisma from "@/prisma";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory, InlineDataPart, InputContent } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const addGroupData = async (data: any) => {
    return await prisma.group.create({ data })
}

export const addChatData = async (data: QueryType) => {
    return await prisma.query.create({ data })
}

export const deleteGroupChat = async (id: string) => {
    await prisma.$transaction([
        prisma.query.deleteMany({ where: { group_id: id } }),
        prisma.group.delete({ where: { id } })
    ])

    revalidatePath('/', 'page');
}

export const sendMessage = async (data: QueryType) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const session = await getAuthSession()
    const user_id = session?.user?.id as string;
    const { group_id, message } = data;

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
    // console.log(history)
    // history.pop();
    // history.pop();

    const chat = model.startChat({
        history: history,
        generationConfig,
        // safetySettings
    });

    try {
        const result = await chat.sendMessage(message);
        const response = result.response;
        const text = response.text();

        return await addChatData({ ...data, response: text });

    } catch (error) {
        console.log(error)
        return await addChatData({ ...data, response: 'Error while generating response' })
    }
}


export const genrateVisionProContent = async (data: QueryType) => {

    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    const session = await getAuthSession()
    const user_id = session?.user?.id as string;

    const { message, images, group_id } = data;
    const imageParts = images!.map((image) => ({ inlineData: image }));

    try {
        const result = await model.generateContent([message, ...imageParts]);
        const response = result.response;
        const text = response.text();

        return await addChatData({ ...data, response: text })

    } catch (error) {
        console.log(error);
        return await addChatData({ ...data, response: 'Error while generating response' })
    }
}

