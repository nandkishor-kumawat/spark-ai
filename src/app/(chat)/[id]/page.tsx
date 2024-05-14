import ChatForm from "@/components/chat-form";
import prisma from '@/prisma';
import ChatList from '@/components/chat-list';
import { Suspense } from 'react';
import { getAuthSession } from '@/app/api/auth/[...nextauth]/options';
import { redirect } from "next/navigation";


export default async function Page({ params }: { params: { id: string } }) {

  const session = await getAuthSession();

  const isUserHasGroup = await prisma.group.findFirst({
    where: {
      id: params.id,
      user_id: session?.user.id
    }
  });

  if (!isUserHasGroup) {
    redirect('/')
  }

  const allHistory = await prisma.query.findMany({
    where: {
      user_id: session?.user.id,
      group_id: params.id
    },
    orderBy: {
      created_at: 'asc'
    }
  })

  const b = allHistory.flatMap(curr => [
    { role: 'user', parts: [{ text: curr.message }] },
    { role: 'model', parts: [{ text: curr.response }] }
  ]);

  const history = allHistory.map(({ message, ...chat }) => ({
    ...chat,
    parts: [{ text: message }]
  }));

  return (
    <div className="w-full h-full flex flex-col items-center gap-2 overflow-hidden">
      <div className="flex flex-1 w-full overflow-y-auto overflow-hidden scrollbar">
        <div className="flex flex-1 w-full p-2">
          <div className="flex flex-col pb-9 text-sm w-full">
            <Suspense fallback={<div className="text-red-500">Loading...</div>}>
              <ChatList history={allHistory} />
            </Suspense>
          </div>
        </div>
      </div>
      <ChatForm />
    </div>
  )
}
