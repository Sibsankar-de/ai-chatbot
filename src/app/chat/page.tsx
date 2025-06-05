"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Navbar } from '../components/Navbar'
import "./chat.style.css";
import { TextBox } from '../components/TextBox';
import { Loader } from '../components/Loader';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm';
import { Footer } from '../components/Footer';
import Head from 'next/head';


type Message = {
    id: number;
    role: string;
    content: string;
    isSuccess: boolean;
}

const ChatPage = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const getResponse = async (message: string) => {
        if (!message.trim() || isLoading) return;

        const userMessage = {
            id: messages.length,
            role: "user",
            content: message.trim(),
            isSuccess: true
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        setIsGenerating(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                }),
            });

            if (!response.ok || !response.body) {
                throw new Error("Error on streaming");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let assistantContent = "";

            const assistantId = messages.length + 1;

            setMessages(prev => [
                ...prev,
                {
                    id: assistantId,
                    role: "assistant",
                    content: "",
                    isSuccess: true
                }
            ]);
            setIsLoading(false);

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                assistantContent += chunk;

                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === assistantId ? { ...msg, content: assistantContent } : msg
                    )
                );
            }
        } catch (error) {
            console.error("Error:", error);
            const assistantId = messages.length + 1;

            setMessages(prev =>
                prev.map(msg =>
                    msg.id === assistantId ? { ...msg, isSuccess: false } : msg
                )
            );
        } finally {
            setIsLoading(false);
            setIsGenerating(false);
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await getResponse(input);
    };


    const boxRef = useRef<HTMLDivElement | null>(null);
    const [autoScroll, setAutoScroll] = useState(true);
    // Auto-scroll logic
    useEffect(() => {
        if (autoScroll && boxRef.current) {
            boxRef.current.scrollTop = boxRef.current.scrollHeight;
        }
    }, [messages, autoScroll]);

    // Detect manual scrolling
    const handleScroll = () => {
        if (boxRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = boxRef.current;
            const isAtBottom = scrollHeight - scrollTop <= clientHeight + 10;
            setAutoScroll(isAtBottom);
        }
    };

    useEffect(() => {
        console.log(messages);
    }, [messages])

    return (
        <>
            <Head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, interactive-widget=resizes-content"
                />
            </Head>
            <div>
                <Navbar />
                <div className='flex justify-center m-3'>
                    <div className='grid grid-rows-[1fr_auto] h-[calc(100svh-115px)] md:w-[70vw] w-[95vw]'>
                        <div className='chat-list-box overflow-y-auto p-4' ref={boxRef} onScroll={handleScroll}>
                            <ul className='chat-list'>
                                {messages.length === 0 ? <StarterComponent onQuery={async (q) => await getResponse(q)} />
                                    :
                                    messages.map((message, index) => {
                                        return <ChatBubble key={index} message={message} isUser={message.role === "user"} />
                                    })}
                                {isLoading && <div className='flex items-center gap-3 mb-10'>
                                    <Loader size={20} />
                                    <div className='response-loader'>Generating responses...</div>
                                </div>}
                            </ul>
                        </div>
                        <div className='flex justify-center'>
                            <TextBox onChange={(e) => setInput(e as string)} value={input} onSend={handleSubmit} isBtnActive={!isGenerating} />
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </>
    )
}

const ChatBubble = ({ message, isUser }: { message: Message; isUser: boolean }) => {
    return (
        <li className={`chat-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`}>
            <div className='grid grid-cols-[auto_1fr] gap-3'>
                {!isUser && <div className='bg-[#5f5f5f4a] p-2 rounded-full h-fit w-fit'><img src="chatbot-logo.png" alt="" className='w-5' /></div>}
                <div className='message'>
                    <Markdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                    </Markdown>
                    {!message.isSuccess && <div className='text-red-400 py-1 px-3 border-1 border-gray-700 rounded-2xl text-[0.8em] w-fit my-3 bg-[#4f4f4f42]'>OOps! Something went wrong while generating response! Try to resend the prompt</div>}
                </div>
            </div>
        </li>
    )
}

const StarterComponent = ({ onQuery }: { onQuery: (query: string) => void }) => {
    const queries = [
        "How will AI change the architect's role in the next decade?",
        "What values matter most in cities and spaces?",
        "What is the biggest risk of using AI in architecture?",
        "What can human intuition do better than AI in design?",
        "Which part of architecture is most ready for AI?",
        "How does your field shape your use of AI?",
        "Can machines take part in architectural creativity?"
    ];
    return (
        <div className='flex flex-col items-center justify-center mt-10 '>
            <div className='bg-[#5f5f5f4a] p-3 rounded-full floating-anim'><img src="chatbot-logo.png" alt="" className='w-20' /></div>
            <h1 className='text-[2em] mb-3'>Hi there!</h1>
            <p>What’s on <span className='text-[#7c29dbfd]'>your mind about AI</span> and architecture?</p>
            <ul className='flex flex-wrap gap-3 mt-5 justify-center'>
                {queries.map((query, index) => (
                    <li key={index} onClick={() => onQuery(query)} className='px-3 py-1 bg-[#3030302a] border-1 border-[#490f8bfd] rounded-2xl hover:bg-[#30303066] cursor-pointer w-fit'>{query}</li>
                ))}

            </ul>
        </div>
    )
}

export default ChatPage