import { getChatsByUserId } from "@/actions/ai.actions";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();

  if (!session || !session.user) {
    return Response.json('Unauthorized!', { status: 401 });
  }

  const chats = await getChatsByUserId(session.user.id);
  return Response.json(chats);
}
