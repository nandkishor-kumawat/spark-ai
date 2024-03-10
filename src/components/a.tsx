"use client";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  Content,
} from "@google/generative-ai";
import { useEffect, useRef, useState } from "react";
import MarkdownPreview, { MarkdownPreviewRef } from '@uiw/react-markdown-preview';
import Chat from "@/components/Chat";
import { marked } from "marked";
import ChatForm from "@/components/chat-form";


const MODELS = {
  PRO: 'gemini-pro',
  VISION: 'gemini-pro-vision',
}



export default function Home() {

  const outputRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [modelName, setModelName] = useState(MODELS.PRO);
  const [file, setFile] = useState<File | null>(null);

  const [prompt, setPrompt] = useState('');

  const [history, setHistory] = useState<Content[]>([]);

  const markdownPreviewRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (markdownPreviewRef.current) {
      const markdownPreview = markdownPreviewRef.current!;
      markdownPreview.scrollTop = markdownPreview.scrollHeight;
      // markdownPreview?.scrollTo({ top: markdownPreview.scrollHeight, behavior: 'smooth' });
    }
  };

  const WriteText = async (prompt: string, setResponse: React.Dispatch<React.SetStateAction<string>>) => {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // await sleep(2000);

    for (let i = 0; i < prompt.length; i += 10) {
      await sleep(10);
      setResponse(prompt.slice(0, i));
      markdownPreviewRef.current!.scrollIntoView({ behavior: 'smooth' });
    }
    setResponse(prompt);
    markdownPreviewRef.current!.scrollIntoView({ behavior: 'smooth' });
  };

  console.log(process.env.GEMINI_API_KEY)

  async function run(e: any) {
    e.preventDefault();
    if (!process.env.GEMINI_API_KEY) {
      console.log('Please set your GEMINI_API_KEY in .env file')
      return
    }

    setLoading(true);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: modelName });

    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const parts = [
      { text: prompt },
    ];


    setHistory([...history, { role: "user", parts }, { role: 'model', parts: [{ text: 'Generating...' }] }]);

    setPrompt('')
    // const result = await model.generateContent({
    //   contents: [{ role: "user", parts }],
    //   generationConfig,
    //   safetySettings,
    // });
    const chat = model.startChat({
      history: history,
      generationConfig,
      // safetySettings
    });

    // const imagePart = await fileToGenerativePart(file as File);

    try {
      // const result = await chat.sendMessage([prompt, imagePart]);
      const result = await chat.sendMessage(prompt);
      const response = result.response;
      WriteText(response.text(), setResponse);
      const h = await chat.getHistory();
      setHistory(h);
      console.log(response.text());
    } catch (error) {
      console.log(error);
      history.pop();
      history.push({ role: 'model', parts: [{ text: 'Error: ' }] });
      setHistory(history);
    }
    // WriteText(prompt, setResponse);
    // setResponse(prompt);
    setLoading(false);

  }
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

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    setFile(file);
  };


  return (

    <div className="flex flex-col pb-9 text-sm w-full">

      {
        history.map((data, i) => (
          <Chat key={i} data={data} />
        ))
      }
      {/* {
      history[history.length - 1]?.role === "model" && response && (
        <Chat data={{ ...history[history.length - 1], parts: [{ text: response }] }} />
      )
    } */}

      <div ref={markdownPreviewRef}></div>
      {/* <div className="no-tailwindcss" dangerouslySetInnerHTML={{ __html: marked(response) }}></div> */}
    </div>
  )
}
