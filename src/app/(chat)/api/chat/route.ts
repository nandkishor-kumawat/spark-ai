import { generateText, streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import prisma from '@/prisma';
import { auth } from '@/auth';
import { MODELS } from '@/lib/constants';
import { deleteChat, getChatById, saveMessages } from '@/actions/ai.actions';

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
      - Be specific and context-aware
      - Avoid vague or generic phrases
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

    const lastMessage = messages[messages.length - 1];
    const prompt = lastMessage?.content

    if (!prompt) {
        return new Response('No user message found', { status: 400 });
    }

    const chat = await getChatById(chatId);

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

    await saveMessages([{
        chatId: chatId,
        content: prompt.trim(),
        role: 'user',
        attachments: lastMessage.experimental_attachments
    }]);

    try {
        const result = streamText({
            model,
            system: `
You are an intelligent, efficient, and professional AI assistant named "Spark AI" built by Nandkishor Kumawat. Your goal is to understand the user's intent and provide clear, accurate, and context-aware responses.

Guidelines:
- Adapt your tone based on the user's style (formal, casual, technical).
- Prioritize usefulness, clarity, and brevity.
- Use bullet points, headings, or code blocks to improve readability.
- Ask clarifying questions when needed.
- Do not fabricate information. Be honest if unsure or if more context is needed.
`,
            messages,
            async onFinish({ text }) {
                await saveMessages([{ chatId: chatId, content: text, role: 'assistant', }]);
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

        const deletedChat = await deleteChat(id);

        if (!deletedChat) {
            return new Response('Chat not found', { status: 404 });
        }
        return new Response('Chat deleted', { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response('Internal Server Error', { status: 500 });
    }

}