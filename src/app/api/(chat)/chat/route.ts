import { generateText, streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import prisma from '@/prisma';
import { auth } from '@/auth';
import { MODELS } from '@/lib/constants';
import { getChatById } from '@/actions/ai.actions';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export const maxDuration = 60;
const model = google('gemini-1.5-flash-002');


const generateTitle = async (prompt: string) => {
    const { text: title } = await generateText({
        model,
        system: `\n
      - you will generate a short title based on the first message a user begins a conversation with
      - ensure it is not more than 80 characters long
      - the title should be a summary of the user's message
      - do not use quotes or colons`,
        prompt
    });
    return title;
}

export const POST = async (req: Request) => {
    const { messages, chatId } = await req.json();
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
        return new Response('Unauthorized', { status: 401 });
    }

    const prompt = messages[messages.length - 1]?.content;

    if (!prompt) {
        return new Response('No user message found', { status: 400 });
    }

    const chat = await prisma.chat.findFirst({
        where: {
            id: chatId,
        },
    });
    if (!chat) {
        //start new chat
        const title = await generateTitle(prompt);
        await prisma.chat.create({
            data: {
                id: chatId,
                userId: session.user.id,
                title
            }
        })
    }

    //save message
    await prisma.message.create({
        data: {
            chatId: chatId,
            content: prompt,
            role: 'user',
        }
    })

    try {
        const result = streamText({
            model,
            system: 'You are Argo, a virtual assistant for farmers, trained and designed by Nandkishor Kumawat(https://github.com/nandkishor-kumawat) and Rajkumar Nagar(https://github.com/Rajkumar-Nagar). You have been trained to help farmers with their queries. You can provide information on weather, crop prices, crop diseases. Provide the best possible answers to the user queries.',
            messages,
            async onFinish({ text, usage, finishReason, response }) {
                //save response
                await prisma.message.create({
                    data: {
                        chatId: chatId,
                        content: text,
                        role: 'assistant',
                    }
                })
            },
        });
        return result.toDataStreamResponse();
    } catch (error) {
        console.error(error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

export const DELETE = async (req: Request) => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return new Response('No id provided', { status: 400 });
    }
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const chat = await getChatById(id);
        if (chat?.userId !== session.user.id) {
            return new Response('Unauthorized', { status: 401 });
        }

        const deletedChat = await prisma.chat.delete({
            where: {
                id
            }
        })
        if (!deletedChat) {
            return new Response('Chat not found', { status: 404 });
        }
        return new Response('Chat deleted', { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response('Internal Server Error', { status: 500 });
    }

}