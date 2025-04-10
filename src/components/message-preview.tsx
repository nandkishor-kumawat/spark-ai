'use client';

import type { ChatRequestOptions, Message } from 'ai';

import { AnimatePresence, motion } from 'framer-motion';
import { memo, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { SparkleIcon, SparklesIcon } from 'lucide-react';
import { Markdown } from './markdown';

const PurePreviewMessage = ({
    chatId,
    message,
    isLoading,
    setMessages,
    reload,
    isReadonly,
}: {
    chatId: string;
    message: Message;
    isLoading: boolean;
    setMessages: (
        messages: Message[] | ((messages: Message[]) => Message[]),
    ) => void;
    reload: (
        chatRequestOptions?: ChatRequestOptions,
    ) => Promise<string | null | undefined>;
    isReadonly: boolean;
}) => {
    const [mode, setMode] = useState<'view' | 'edit'>('view');
    return (
        <AnimatePresence>
            <motion.div
                className="w-full mx-auto max-w-3xl px-4 group/message"
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                data-role={message.role}
            >
                <div
                    className={cn(
                        'flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
                        {
                            'w-full': mode === 'edit',
                            'group-data-[role=user]/message:w-fit': mode !== 'edit',
                        },
                    )}
                >
                    {message.role === 'assistant' && (
                        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
                            <SparklesIcon size={14} />
                        </div>
                    )}

                    <div className="flex flex-col gap-4 w-full">

                        {message.content && mode === 'view' && (
                            <div className="flex flex-row gap-2 items-start">
                                {/* {message.role === 'user' && !isReadonly && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                                                onClick={() => {
                                                    setMode('edit');
                                                }}
                                            >
                                                <PencilIcon />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Edit message</TooltipContent>
                                    </Tooltip>
                                )} */}

                                <div
                                    className={cn('flex flex-col gap-4', {
                                        'bg-muted text-muted-foreground px-3 py-1.5 rounded-xl':
                                            message.role === 'user',
                                    })}
                                >
                                    <Markdown>{message.content as string}</Markdown>
                                </div>
                            </div>
                        )}

                        {/* {message.content && mode === 'edit' && (
              <div className="flex flex-row gap-2 items-start">
                <div className="size-8" />

                <MessageEditor
                  key={message.id}
                  message={message}
                  setMode={setMode}
                  setMessages={setMessages}
                  reload={reload}
                />
              </div>
            )} */}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export const MessagePreview = memo(
    PurePreviewMessage,
    (prevProps, nextProps) => {
        if (prevProps.isLoading !== nextProps.isLoading) return false;
        if (prevProps.message.content !== nextProps.message.content) return false;
        return true;
    },
);

export const ThinkingMessage = () => {
    const role = 'assistant';

    return (
        <motion.div
            className="w-full mx-auto max-w-3xl px-4 group/message "
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
            data-role={role}
        >
            <div
                className={cn(
                    'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl',
                    {
                        'group-data-[role=user]/message:bg-muted': true,
                    },
                )}
            >
                <div className="size-8 flex items-center rounded-full animate-spin justify-center ring-1 shrink-0 ring-border">
                    <SparkleIcon size={14} />
                </div>

                <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-col gap-4 text-muted-foreground">
                        Thinking...
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
