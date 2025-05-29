import Link from 'next/link';
import React, { memo, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from './ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface CodeBlockProps {
    node: any;
    inline: boolean;
    className: string;
    children: any;
}

const CodeBlock = ({ node, inline, className, children, ...props }: CodeBlockProps) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : 'text';

    const handleCopy = () => {
        navigator.clipboard.writeText(children);
        toast.success("Copied to clipboard! ")
    };

    return !inline && !node.children[0]?.position ? (
        <pre className={cn(className, "bg-muted/70 rounded-md scrollbar-h my-1 [font-size:85%] pb-1 group/copy overflow-hidden")} {...props}>
            <div className='bg-zinc-200 flex justify-between items-center dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-4 py-2'>
                <span className='text-xs text-zinc-500 dark:text-zinc-400'>{language}</span>
                <Button
                    variant="ghost"
                    size={'sm'}
                    className="flex py-0.5 transition-opacity duration-150 text-xs h-fit gap-2 rounded-full text-muted-foreground opacity-0 group-hover/copy:opacity-100"
                    onClick={handleCopy}
                    title={"Copy code to clipboard"}
                    aria-label={"Copy code to clipboard"}
                >
                    <Copy size={12} />
                    <span>Copy</span>
                </Button>
            </div>
            <code className={`language-${language} code-highlight overflow-auto block p-4`}>{children}</code>
        </pre>
    ) : (
        <code
            className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
            {...props}
        >
            {children}
        </code>
    );
}


const components: Partial<Components> = {
    code: CodeBlock as Components['code'],
    pre: ({ children }) => <>{children}</>,
    ol: ({ node, children, ...props }) => {
        return (
            <ol className="list-decimal ml-8" {...props}>
                {children}
            </ol>
        );
    },
    li: ({ node, children, ...props }) => {
        return (
            <li className="py-1" {...props}>
                {children}
            </li>
        );
    },
    ul: ({ node, children, ...props }) => {
        return (
            <ul className="list-disc ml-8" {...props}>
                {children}
            </ul>
        );
    },
    strong: ({ node, children, ...props }) => {
        return (
            <span className="font-semibold" {...props}>
                {children}
            </span>
        );
    },
    a: ({ node, children, ...props }) => {
        return (
            // @ts-expect-error
            <Link
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noreferrer"
                {...props}
            >
                {children}
            </Link>
        );
    },
    h1: ({ node, children, ...props }) => {
        return (
            <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>
                {children}
            </h1>
        );
    },
    h2: ({ node, children, ...props }) => {
        return (
            <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>
                {children}
            </h2>
        );
    },
    h3: ({ node, children, ...props }) => {
        return (
            <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>
                {children}
            </h3>
        );
    },
    h4: ({ node, children, ...props }) => {
        return (
            <h4 className="text-lg font-semibold mt-6 mb-2" {...props}>
                {children}
            </h4>
        );
    },
    h5: ({ node, children, ...props }) => {
        return (
            <h5 className="text-base font-semibold mt-6 mb-2" {...props}>
                {children}
            </h5>
        );
    },
    h6: ({ node, children, ...props }) => {
        return (
            <h6 className="text-sm font-semibold mt-6 mb-2" {...props}>
                {children}
            </h6>
        );
    },
    p: ({ node, children, ...props }) => {
        return (
            <p className="text-justify" {...props}>
                {children}
            </p>
        );
    },
};

const remarkPlugins = [remarkGfm];

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
    return (
        <ReactMarkdown
            remarkPlugins={remarkPlugins}
            components={components}
        >
            {children}
        </ReactMarkdown>
    );
};

export const NonMemoizedMarkdown1 = ({ children }: { children: string }) => {
    return (
        <MarkdownPreview
            source={children}
            style={{ background: 'none' }}
            rehypeRewrite={(node, index, parent) => {
                if (node.type === "element") {
                    if (node.tagName === "a") {
                        node.properties.target = "_blank"
                        node.properties.rel = "noreferrer"
                    }


                    if (node.tagName === "pre") {
                        if ((node.children[0] as any).tagName === "code" && (node.children[1] as any).properties.class == "copied") {
                            const code = node.children[0] as any
                            const copied = node.children[1]
                            const language = code?.properties?.className?.[0]?.split("-")[1]
                            node.properties.className = "group/copy "


                            node.children[0] = {
                                type: "element",
                                tagName: "div",
                                properties: {
                                    className: cn(
                                        buttonVariants({ size: 'sm', variant: 'ghost' }),
                                        "bg-zinc-200 flex justify-between items-center dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-4 py-2 rounded-t-md"
                                    )
                                },
                                children: [
                                    {
                                        type: "element",
                                        tagName: "span",
                                        properties: {
                                            className: "text-xs text-zinc-500 dark:text-zinc-400",
                                        },
                                        children: [{ type: "text", value: language }],
                                    },
                                    {
                                        type: "element",
                                        tagName: "button",
                                        properties: {
                                            className:
                                                "copy-btn flex py-0.5 transition-opacity duration-150 text-xs h-fit gap-2 rounded-full text-muted-foreground opacity-0 group-hover/copy:opacity-100 active:text-white",
                                            title: "Copy code to clipboard",
                                            "aria-label": "Copy code to clipboard",
                                            "data-code": (copied as any).properties["data-code"]
                                        },
                                        children: [
                                            {
                                                type: "element",
                                                tagName: "svg",
                                                properties: {
                                                    xmlns: "http://www.w3.org/2000/svg",
                                                    width: "12",
                                                    height: "12",
                                                    viewBox: "0 0 24 24",
                                                    fill: "none",
                                                    stroke: "currentColor",
                                                    strokeWidth: "2",
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                },
                                                children: [
                                                    { type: "element", tagName: "rect", properties: { x: "9", y: "9", width: "13", height: "13", rx: "2", ry: "2" }, children: [] },
                                                    { type: "element", tagName: "path", properties: { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" }, children: [] }
                                                ]
                                            },
                                            { type: "element", tagName: "span", properties: {}, children: [{ type: "text", value: "Copy" }] }
                                        ],
                                    },
                                ],
                            };

                            node.children[1] = code;
                        }
                    }
                }
            }}
        />
    );
};

export const Markdown11 = memo(NonMemoizedMarkdown, (prevProps, nextProps) => prevProps.children === nextProps.children,);
export const Markdown1 = memo(NonMemoizedMarkdown1, (prevProps, nextProps) => prevProps.children === nextProps.children,);

export const Markdown = Markdown11