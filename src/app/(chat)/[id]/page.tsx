import prisma from '@/prisma';
import ChatList from '@/components/chat-list';
import { Suspense } from 'react';
import { getAuthSession } from '@/app/api/auth/[...nextauth]/options';
import { redirect } from "next/navigation";
import ChatSkeleton from '@/components/chat-skeleton';


export default async function Page({ params }: { params: { id: string } }) {

  const session = await getAuthSession();
  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/chat/[id]')
  }

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
    <div className="flex flex-col pb-9 text-sm w-full h-full">
      <Suspense fallback={<ChatSkeleton />}>
        <ChatList history={allHistory} />
      </Suspense>
    </div>
  )
}
