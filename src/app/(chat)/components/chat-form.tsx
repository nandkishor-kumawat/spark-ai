"use client"
import { useCallback, useRef, useState } from 'react';
import AutoHeightTextarea from '@/components/auto-height-textarea';
import { Button } from '@/components/ui/button';
import { ArrowUpIcon, Loader2, PaperclipIcon, Square } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { toast } from 'sonner';
import { Attachment } from 'ai';
import AttachmentPreview from './attachment-preview';

interface ChatFormProps {
    chatId: string;
    input: string;
    setInput: (value: string) => void;
    isLoading: boolean;
    stop: () => void;
    handleSubmit: ReturnType<typeof useChat>['handleSubmit'];
}

export default function ChatForm({
    chatId,
    input,
    setInput,
    isLoading,
    stop,
    handleSubmit,
}: ChatFormProps) {

    const [attachments, setAttachments] = useState<Attachment[]>([])
    const [uploadQueue, setUploadQueue] = useState<{ file: File; controller: AbortController }[]>([]);


    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadFile = async (file: File, signal: AbortSignal) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/files/upload', {
                method: 'POST',
                body: formData,
                signal,
            });

            if (response.ok) {
                const data = await response.json();
                const { url, name, type } = data;
                return { url, name, contentType: type };
            }
            const { error } = await response.json();
            toast.error(error);
        } catch (error) {
            if ((error as Error).name === 'AbortError') {
                console.log('Upload cancelled');
            } else {
                toast.error('Failed to upload file, please try again!');
            }
        }
    };


    const handleUploadFiles = useCallback(async (files: File[]) => {
        const validFiles = files.filter(file => {
            if (file.size <= 5 * 1024 * 1024 && file.type.startsWith('image/')) {
                return true;
            } else {
                toast.error('Max size: 5MB');
                return false;
            }
        });

        if (validFiles.length === 0) return;

        const uploaders = validFiles.map(async (file) => {
            const controller = new AbortController();
            setUploadQueue((prev) => [...prev, { file, controller }]);
            return uploadFile(file, controller.signal)
                .then((result) => {
                    if (result) {
                        setAttachments((prev) => [...prev, result]);
                    }
                })
                .finally(() => {
                    setUploadQueue((prev) => prev.filter((f) => f.file !== file));
                });
        });

        await Promise.allSettled(uploaders);
    }, []);



    const handlePaste = useCallback(async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const items = Array.from(e.clipboardData?.items || []);
        const files = [] as File[];

        items.forEach((item) => {
            if (item.kind === 'file') {
                if (item.type.startsWith('image/')) {
                    const file = item.getAsFile();
                    if (file) {
                        files.push(file);
                    }
                } else {
                    toast.error('Only images are allowed');
                    e.preventDefault();
                }
            }
        });
        if (files.length === 0) return
        e.preventDefault();
        await handleUploadFiles(files);
    }, [handleUploadFiles]);


    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        await handleUploadFiles(files)
        e.target.value = '';
    }, [handleUploadFiles]);


    const submitForm = useCallback(() => {
        window.history.replaceState({}, '', `/chat/${chatId}`);

        handleSubmit(undefined, {
            experimental_attachments: attachments
        })

        setAttachments([])
    }, [handleSubmit, chatId, attachments]);

    const handleFileDelete = useCallback(async (attachment: Attachment) => {
        setAttachments((prev) => prev.filter((a) => a.url !== attachment.url));
        // const res = await fetch(`/api/files/${attachment.name}`, {
        //     method: 'DELETE',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        // });
        // if (res.ok) {
        //     toast.success('Attachment deleted successfully');
        // }
    }, []);


    return (
        <div className="relat ive w-full flex flex-col gap-4">

            {(attachments.length > 0 || uploadQueue.length > 0) && (
                <div className="flex flex-row gap-2 overflow-x-auto items-end">
                    {attachments.map((attachment) => (
                        <AttachmentPreview
                            key={attachment.url}
                            attachment={attachment}
                            handleDelete={() => handleFileDelete(attachment)}
                        />
                    ))}

                    {uploadQueue.map(({ file, controller }, i) => (
                        <AttachmentPreview
                            key={i}
                            attachment={{
                                url: URL.createObjectURL(file),
                                name: file.name,
                                contentType: file.type || 'image/png',
                            }}
                            isUploading={true}
                            handleDelete={() => {
                                controller.abort();
                                setUploadQueue(prev => prev.filter((_, index) => index !== i));
                            }}
                        />
                    ))}

                </div>
            )}


            <div className="flex flex-col pt-2 transition-all focus-within:ring-ring focus-within:ring-2 rounded-2xl bg-muted dark:border-zinc-700">
                <AutoHeightTextarea
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onPaste={handlePaste}
                    className="min-h-[24px] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none max-h-[calc(30dvh)] scrollbar-none resize-none rounded-2xl !text-base bg-muted"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (input.trim()) submitForm()
                        }
                    }}
                />

                <div className="relative flex items-center justify-between">
                    <div className="p-2 w-fit flex flex-row justify-start">
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            accept='image/*'
                            onChange={handleFileChange}
                            tabIndex={-1}
                            multiple
                            disabled={uploadQueue.length !== 0}
                        />
                        <Button
                            type="button"
                            variant={'ghost'}
                            className="rounded-full p-1.5 h-fit"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <PaperclipIcon size={14} />
                        </Button>
                    </div>

                    <div className="p-2 w-fit flex flex-row justify-end">
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <SendButton
                                handleSubmit={submitForm}
                                disabled={!input.trim() || uploadQueue.length !== 0}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


const SendButton = ({
    handleSubmit,
    disabled,
}: {
    handleSubmit: () => void;
    disabled?: boolean;
}) => {
    return (
        <Button
            type="button"
            disabled={disabled}
            onClick={handleSubmit}
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