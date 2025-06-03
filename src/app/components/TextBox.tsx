"use client";

import React, { useRef, useState } from 'react'
import { Loader } from './Loader';

export const TextBox = ({ onChange, value, onSend, isBtnActive = true }: { onChange: (e: String) => void, value: string, onSend: (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<Element>) => void, isBtnActive: Boolean }) => {
    const textBoxRef = useRef<HTMLTextAreaElement>(null);
    const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.target.style.height = 'auto'
        e.target.style.height = `${e.target.scrollHeight}px`
    }

    // handle textare resize on input
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (onChange) {
            onChange(e.target.value);
        }
        handleTextArea(e);
    }

    const handleSendOnEnter = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend(e);
        }
    }

    return (
        <div className='text-box w-[80%]'>
            <div><textarea name="" id="" className='pl-2' placeholder='Write your queries here' ref={textBoxRef} onChange={handleInputChange} value={value} onKeyDown={handleSendOnEnter} ></textarea></div>
            <div><button className="btn btn-neon w-12 h-12 !rounded-full !p-0" onClick={(e) => onSend(e)} disabled={!isBtnActive}>{isBtnActive ? <span className='!text-[1.7em] font-bold'><i className="bi bi-arrow-up-short font-bold"></i></span> : <Loader size={30} />}</button></div>
        </div>
    )
}
