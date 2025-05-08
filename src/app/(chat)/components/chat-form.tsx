"use client"
import { useCallback } from 'react';
import AutoHeightTextarea from '@/components/auto-height-textarea';
import { Button } from '@/components/ui/button';
import { ArrowUpIcon, Loader2, Square, } from 'lucide-react';

interface ChatFormProps {
    chatId: string;
    input: string;
    setInput: (value: string) => void;
    isLoading: boolean;
    stop: () => void;
    handleSubmit: () => void;
}

export default function ChatForm({
    chatId,
    input,
    setInput,
    isLoading,
    stop,
    handleSubmit,
}: ChatFormProps) {

    const submitForm = useCallback(() => {
        window.history.replaceState({}, '', `/chat/${chatId}`);
        handleSubmit()
    }, [handleSubmit, chatId]);



    return (
        <div className="relative w-full flex flex-col gap-4">
            <AutoHeightTextarea
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[24px] transition-all focus-visible:ring-offset-0 max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl !text-base bg-muted pb-10 dark:border-zinc-700"
                onKeyDown={(e) => {

                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (input.trim()) submitForm()
                    }
                }
                }
            />
            <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end">
                {isLoading ? (
                    <Loader2 className="animate-spin" size={18} />
                ) : (
                    <SendButton
                        input={input}
                        submitForm={submitForm}
                    />
                )}
            </div>
        </div>
    );
}


const SendButton = ({
    input,
    submitForm,
}: {
    input: string;
    submitForm: () => void;
}) => {
    return (
        <Button
            type="button"
            disabled={!input.trim()}
            onClick={submitForm}
            className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
        >
            <ArrowUpIcon size={14} />
        </Button>
    );
}
const StopButton = ({
    stop,
}: {
    stop: () => void;
}) => {
    return (
        <Button
            className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
            onClick={stop}
            type='button'
        >
            <Square fill='black' size={14} />
        </Button>
    );
}