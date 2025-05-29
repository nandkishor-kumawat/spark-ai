import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Attachment } from 'ai';
import { File, FileText, LoaderIcon, Trash2 } from 'lucide-react';
import Image from 'next/image';


const AttachmentPreview = ({
    attachment,
    isUploading = false,
    handleDelete
}: {
    attachment: Attachment;
    isUploading?: boolean;
    handleDelete?: () => void;
}) => {
    const { name, url, contentType } = attachment;
    const isImage = contentType?.startsWith('image/');
    return (
        <div className="flex flex-col gap-2 relative">
            <div className={cn("bg-muted overflow-hidden group/attachment rounded-md relative flex flex-col items-center justify-center", {
                'w-20 h-16 aspect-video': isImage,
            })}>
                {isImage ? (
                    <Image
                        key={url}
                        src={url}
                        width={80}
                        height={64}
                        alt={name ?? 'An image attachment'}
                        className="rounded-md size-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center w-fit px-2 py-1.5 text-sm text-zinc-500">
                        <FileText size={14} />
                        <span className="ml-1 border-l border-l-zinc-500 pl-1">{name}</span>
                    </div>
                )}

                {isUploading && (
                    <div
                        className='absolute inset-0 flex items-center bg-zinc-600/80 justify-center transition-all'>
                        <div className="animate-spin absolute z-40 text-white">
                            <LoaderIcon size={16} />
                        </div>
                    </div>
                )}

                {handleDelete && !isUploading && <div
                    className='absolute p-0.5 z-40 hidden group-hover/attachment:flex inset-0 h-full items-center justify-center bg-zinc-600/80 transition-all duration-300 '>
                    <Button
                        type="button"
                        className='p-0.5 h-fit hover:bg-transparent'
                        variant="ghost"
                        onClick={handleDelete}
                    >
                        <Trash2 className='text-red-600' size={16} />
                    </Button>
                </div>}
            </div>
            {/* {!isImage && <div className="text-xs text-zinc-500 max-w-16 truncate" title={name}>{name}</div>} */}
        </div>
    );
};

export default AttachmentPreview;