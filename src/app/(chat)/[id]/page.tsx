
import MarkdownPreview, { MarkdownPreviewRef } from '@uiw/react-markdown-preview';
import Chat from "@/components/Chat";
import { marked } from "marked";
import ChatForm from "@/components/chat-form";
import prisma from '@/prisma';
import ChatList from '@/components/chat-list';
import { Suspense } from 'react';
import { getAuthSession } from '@/app/api/auth/[...nextauth]/options';


const MODELS = {
  PRO: 'gemini-pro',
  VISION: 'gemini-pro-vision',
}



export default async function Page({ params }: { params: { id: string } }) {

  const session = await getAuthSession();

  const allHistory = await prisma.chats.findMany({
    where: {
      user_id: session?.user.id,
      group_id: params.id
    },
    orderBy: {
      created_at: 'asc'
    }
  })
  const history = allHistory.map(({ message, ...chat }) => ({
    ...chat,
    parts: [{ text: message }]
  }));

  return (
    <div className="w-full h-full flex flex-col items-center gap-2">
      <div className="flex flex-1 w-full overflow-auto scrollbar">
        <div className="flex flex-1 w-full p-2">
          <div className="flex flex-col pb-9 text-sm w-full">
            <Suspense fallback={<div>Loading...</div>}>
              <ChatList history={history} />
            </Suspense>
          </div>
        </div>
      </div>
      <ChatForm />
    </div>

  )
}
