"use client"
import React, { useEffect, useRef } from 'react'
import MarkdownPreview, { MarkdownPreviewRef } from '@uiw/react-markdown-preview';
import { Content } from '@google/generative-ai';
import rehypeSanitize from "rehype-sanitize";
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useSession } from 'next-auth/react';

const Chat = ({ data, isLast }: { data: Content, isLast?: boolean }) => {

    const { role, parts } = data;
    const text = parts[0].text!;
    const [prompt, setPrompt] = React.useState<string>(text);
    const {data:session} = useSession()

    const markdownPreviewRef = useRef<MarkdownPreviewRef>(null);
    const ref = useRef<HTMLDivElement>(null);

    // useEffect(() => {
    //     ref.current!.scrollIntoView({ behavior: 'smooth' });
    // }, [prompt])


    const WriteText = async () => {
        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        for (let i = 0; i < text.length; i += 10) {
            await sleep(10);
            setPrompt(text.slice(0, i));
        }
        setPrompt(text);
    };


    // useEffect(() => {
    //     if (isLast) {
    //         WriteText();
    //     } else {
    //         setPrompt(text);
    //     };
    // }, [data, isLast]);

    return (
        <div className='w-full mb-2 text-primary'>
            <div className="px-4 py-2 justify-center text-base md:gap-6 m-auto">
                <div className="flex flex-1 text-base mx-auto gap-3 md:px-5 lg:px-1 xl:px-5 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem] group">

                    <div className='flex-shrink-0 flex flex-col relative items-end'>
                        <div>
                            <Avatar>
                                <AvatarImage src={role==='user'?(session?.user.image as string):''} />
                                <AvatarFallback>{role==='user'?(session?.user.name?.charAt(0) as string):'AI'}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>

                    <div className='relative flex w-full flex-col'>
                        <div className='pb-2'>{role==='user'?'You':'AI'}</div>

                        {text && <div className="flex overflow-hidden">
                            <MarkdownPreview
                                ref={markdownPreviewRef}
                                source={text}
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
                            {/* <p className='whitespace-pre-wrap'>{parts[0].text}</p> */}
                        </div>}
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Chat