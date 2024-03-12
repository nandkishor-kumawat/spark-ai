"use client"
import { addGroupData, genrateVisionProContent, sendMessage } from '@/actions'
import { MODELS } from '@/lib/constants';
import { QueryType } from '@/lib/types';
import { addModelChat, addUserChat } from '@/redux/features/chatSlice';
import { useAppDispatch } from '@/redux/store'
import { InlineDataPart } from '@google/generative-ai';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import React, { useTransition } from 'react'

const ChatForm = ({ vision }: { vision?: boolean }) => {

    const dispatch = useAppDispatch();
    const [isPending, startTransition] = useTransition();
    const { id } = useParams();
    const router = useRouter();
    const formRef = React.useRef<HTMLFormElement>(null);
    const { data: session } = useSession();
    const [files, setFiles] = React.useState<FileList | null>(null);

    async function fileToGenerativePart(file: File) {
        const base64EncodedDataPromise = new Promise((resolve) => {
            const reader = new FileReader() as any;
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(file);
        });
        return {
            inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
        };
    }

    const handleVisionChat = async (prompt: string) => {
        if (!files) return;
        const imageParts = await Promise.all(Array.from(files).map(fileToGenerativePart)) as InlineDataPart[];

        const group_id = "65edbe938dc79309d5143a85"
        startTransition(async () => {
            const data = {
                user_id: session?.user.id as string,
                group_id,
                message: prompt,
                images: imageParts.map((image) => ({ ...image.inlineData })),
                model: MODELS.VISION,
                response: 'Generating...'
            } as QueryType;

            dispatch(addUserChat(data));

            const response = await genrateVisionProContent(data) as QueryType;;
            dispatch(addModelChat(response));
        })

        formRef.current!.reset();
    }

    const sendData = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const prompt = formData.get('prompt') as string;

        if (vision) return handleVisionChat(prompt);

        let group_id = id as string;
        if (!id) {
            const group = await addGroupData({
                name: prompt,
                user_id: session?.user.id as string,
            })
            group_id = group.id;
            router.push(`/${group_id}`);
        }

        startTransition(async () => {
            const chat = {
                user_id: session?.user.id as string,
                group_id: group_id,
                message: prompt,
                model: MODELS.PRO,
                response: 'Generating...'
            } as QueryType;

            dispatch(addUserChat(chat));
            const response = await sendMessage(chat) as QueryType;
            dispatch(addModelChat(response));
        })
        formRef.current!.reset();
    }


    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiles(e.target.files!);
    }


    return (
        <div className="w-full m-2 md:pt-0 dark:border-white/20 md:border-transparent md:dark:border-transparent md:w-[calc(100%-.5rem)]">
            <div className="stretch mx-2 flex flex-row gap-3  md:mx-4 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
                <form ref={formRef} className="flex justify-between w-full gap-1 items-end" onSubmit={sendData}>
                    <div className="w-full border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                        <div className="px-4 py-2 bg-white rounded-t-lg dark:bg-gray-800 relative">
                            <textarea name="prompt" rows={4} className="w-full px-0 text-sm text-gray-900 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400 p-2 outline-none resize-none" placeholder="Write a prompt..." required></textarea>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 border-t dark:border-gray-600">
                            <div className="flex ps-0 space-x-1 rtl:space-x-reverse sm:ps-2">
                                {vision && (
                                    <label htmlFor="file-upload" className="inline-flex justify-center items-center p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                        <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                            <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                                        </svg>
                                        <input required id="file-upload" type="file" multiple accept='image/png, image/jpeg, image/webp, image/heic, image/heif' name='files' className="sr-only" onChange={handleFileUpload} />
                                    </label>
                                )}
                                {/* {Object.values(MODELS).map((model) => (
                                    <button key={model} type="button" onClick={() => setModelName(model)} className={`inline-flex justify-center items-center p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 ${modelName === model ? 'bg-gray-100 dark:bg-gray-600' : ''}`}>
                                        {model}</button>
                                ))} */}
                            </div>
                            <button type="submit" className="inline-flex items-center py-2.5 px-4 text-md font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800">
                                {isPending ? 'Generating...' : 'Generate'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ChatForm