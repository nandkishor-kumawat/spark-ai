import { auth } from "@/auth";
import prisma from "@/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
    const { id, systemPrompt } = await req.json();
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
        return new Response('Unauthorized', { status: 401 });
    }
    if (!id || !systemPrompt) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const chat = await prisma.chat.update({
        where: { id },
        data: { systemPrompt },
    });

    return NextResponse.json(chat);
}
