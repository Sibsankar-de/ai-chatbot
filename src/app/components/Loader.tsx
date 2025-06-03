import React from 'react'

export const Loader = ({ size=20 }: { size: number }) => {
    return (
        <div className='spinner' style={{ width: `${size}px`, height: `${size}px` }}></div>
    )
}
