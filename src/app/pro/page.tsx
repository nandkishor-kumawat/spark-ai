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


  async function run(e: any) {
    e.preventDefault();

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
    const imagePart = await fileToGenerativePart(file as File);
    
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
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader?.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise as string, mimeType: file.type },
    };
  }

  const handleFileUpload =async (e: any) => {
    const file = e.target.files[0];
    setFile(file);
  };

  return (

    <div className="w-full h-full overflow-hidden">
      <div className="flex gap-2 w-full h-full">
        <div className="sidebar w-[260px] border-[#464e5d] border-r h-full">

        </div>

        <div className="flex flex-1 w-full h-full justify-center">
          <div className="w-full h-full flex flex-col items-center gap-2">
            <div className="flex flex-1 w-full overflow-auto scrollbar">
              <div className="flex flex-1 w-full p-2">
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
              </div>
            </div>



            <div className="w-full m-2 md:pt-0 dark:border-white/20 md:border-transparent md:dark:border-transparent md:w-[calc(100%-.5rem)]">
              <div className="stretch mx-2 flex flex-row gap-3  md:mx-4 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
                <form className="flex justify-between w-full gap-1 items-end" onSubmit={run}>
                  <div className="w-full border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    <div className="px-4 py-2 bg-white rounded-t-lg dark:bg-gray-800 relative">
                      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} id="prompt" rows={4} className="w-full px-0 text-sm text-gray-900 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400 p-2 outline-none resize-none" placeholder="Write a prompt..." required></textarea>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 border-t dark:border-gray-600">
                      <div className="flex ps-0 space-x-1 rtl:space-x-reverse sm:ps-2">
                        <label htmlFor="file-upload" className="inline-flex justify-center items-center p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                          <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                            <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                          </svg>
                          <input id="file-upload" type="file" className="sr-only" onChange={handleFileUpload} />
                        </label>
                        {Object.values(MODELS).map((model) => (
                          <button key={model} type="button" onClick={() => setModelName(model)} className={`inline-flex justify-center items-center p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 ${modelName === model ? 'bg-gray-100 dark:bg-gray-600' : ''}`}>
                            {model}</button>
                        ))}
                      </div>
                      <button type="submit" className="inline-flex items-center py-2.5 px-4 text-md font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800">
                        {loading ? 'Generating...' : 'Generate'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>


          </div>

        </div>
      </div>
    </div>
  )
}
