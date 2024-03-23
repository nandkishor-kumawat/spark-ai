"use client"
import React, { useRef } from 'react'
import MarkdownPreview, { MarkdownPreviewRef } from '@uiw/react-markdown-preview';
import rehypeSanitize from "rehype-sanitize";
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useSession } from 'next-auth/react';
import { QueryType } from '@/lib/types';
import { MODELS } from '@/lib/constants';
import Image from 'next/image';

interface Props {
    chat: QueryType;
    isLast?: boolean;
}

const Chat = ({ chat, isLast }: Props) => {
    const { message, images, model } = chat;
    const text = message;
    const [prompt, setPrompt] = React.useState<string>(text);
    const { data: session } = useSession()

    const markdownPreviewRef = useRef<MarkdownPreviewRef>(null);
    const ref = useRef<HTMLDivElement>(null);

    return (
        <div className='w-full mb-2 text-primary'>
            <div className="px-4 py-2 justify-center text-base md:gap-6 m-auto">
                <div className="flex flex-1 text-base mx-auto gap-3 md:px-5 lg:px-1 xl:px-5 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem] group">
                    <div className='flex-shrink-0 flex flex-col relative items-end'>
                        <div>
                            <Avatar>
                                <AvatarImage src={(session?.user.image as string)} />
                                <AvatarFallback>{(session?.user.name?.charAt(0) as string)}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>

                    <div className='relative flex w-full flex-col'>
                        <div className='pb-2'>{'You'}</div>
                        <div className="flex overflow-hidden overflow-x-auto no-tailwindcss">
                            <p className='whitespace-pre-wrap text-[#c9d1d9]'>{text}</p>
                        </div>

                        {model === MODELS.VISION && images && (
                            <div className="mt-3 flex flex-wrap gap-3">
                                {
                                    images?.map((image, index) => {
                                        return <Image
                                            key={index}
                                            width={200}
                                            height={200}
                                            alt={'image'}
                                            src={`data:${image.mimeType};base64,${image.data}`}
                                            className="object-contain"
                                        />
                                    })
                                }
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-4 py-2 justify-center text-base md:gap-6 m-auto">
                <div className="flex flex-1 text-base mx-auto gap-3 md:px-5 lg:px-1 xl:px-5 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem] group">
                    <div className='flex-shrink-0 flex flex-col relative items-end'>
                        <div>
                            <Avatar>
                                <AvatarImage src={''} />
                                <AvatarFallback>{'AI'}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>

                    <div className='relative flex w-full flex-col'>
                        <div className='pb-2'>{'AI'}</div>
                        {chat.response && <div className="flex overflow-hidden overflow-x-auto no-tailwindcss">
                            <MarkdownPreview
                                ref={markdownPreviewRef}
                                source={chat.response}
                                // rehypeRewrite={(node, index, parent) => {
                                //   if (node.tagName === "a" && parent && /^h(1|2|3|4|5|6)/.test(parent.tagName)) {
                                //     parent.children = parent.children.slice(1)
                                //   }
                                // }}
                                className='no-tailwindcss'
                                style={{
                                    backgroundColor: 'transparent',
                                }}
                                rehypePlugins={[rehypeSanitize]}
                            />
                        </div>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Chat