import { auth } from '@/auth';
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { z } from 'zod';


const FileSchema = z
    .instanceof(Blob)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
        message: 'File size should be less than 5MB',
    })
    .refine((file) => file.type.startsWith('image/'), {
        message: 'File type should be JPEG or PNG',
    })

export async function POST(request: Request) {
    const session = await auth();

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (request.body === null) {
        return new Response('Request body is empty', { status: 400 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as Blob;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const validatedFile = FileSchema.safeParse(file);

        if (!validatedFile.success) {
            const errorMessage = validatedFile.error.errors
                .map((error) => error.message)
                .join(', ');

            return NextResponse.json({ error: errorMessage }, { status: 400 });
        }

        const filename = (formData.get('file') as File).name;
        const fileBuffer = await file.arrayBuffer();

        const uniqueFilename = `${Date.now()}_${filename}`;

        try {
            const data = await put(`${uniqueFilename}`, fileBuffer, {
                access: 'public',
            });

            return NextResponse.json(data);
        } catch (error) {
            console.error(error)
            return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 },
        );
    }
}
