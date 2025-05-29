import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from './ui/textarea';


const AutoHeightTextarea = ({ value, onChange, placeholder, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [height, setHeight] = useState('auto');

    useEffect(() => {
        const textarea = textareaRef.current!;
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(e);
    };

    return (
        <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            style={{ height, resize: 'none', ...props.style }}
            rows={2}
            {...props}
        />
    );
};

export default AutoHeightTextarea;
