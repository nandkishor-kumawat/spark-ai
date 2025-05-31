import { auth } from "@/auth";

export const DELETE = async (request: Request, { params }: { params: Promise<{ fileName: string }> }) => {
    const { fileName } = await params;
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const res = await fetch(`${process.env.BACKEND_ENDPOINT}/api/v1/files/${fileName}`, {
            method: 'DELETE',
        });
        if (!res.ok) {
            const errorData = await res.json();
            console.error('Error deleting file:', errorData);
            return new Response('Failed to delete file', { status: res.status });
        }
        console.log('File deleted successfully:');
        return new Response('File deleted successfully', { status: 200 });
    } catch (error) {
        console.error('Error deleting file:', error);
        return new Response('Failed to delete file', { status: 500 });
    }
}