"use clients";

import React from 'react'

export const Navbar = () => {
    return (
        <header className='flex justify-center'>
            <nav className='p-3 flex justify-between w-[80%]'>
                <div className='flex items-center gap-3'>
                    <img src="chatbot-logo.png" alt="" className='w-5' />
                    <h5 className='text-[1.2em] font-bold text-gray-400 font-sans'>AI Chatbot</h5>
                </div>
                <div className='flex items-center gap-7'>
                    <button className="btn btn-neon" onClick={() => window.location.reload()}><span><i className="bi bi-pencil-square"></i></span><span>New chat</span></button>
                    {/* <div>
                        <input type="checkbox" className='hidden' id='theme-checkbox' />
                        <label htmlFor="theme-checkbox" className='theme-toogler'>
                            <div className='toogler-option'><span><i className="bi bi-brightness-high-fill"></i></span></div>
                            <div className='toogler-option'><span><i className="bi bi-moon-stars-fill"></i></span></div>
                        </label>
                    </div> */}
                </div>
            </nav>
        </header>
    )
}
