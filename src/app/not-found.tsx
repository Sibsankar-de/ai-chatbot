import Link from 'next/link'
import React from 'react'

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', padding: '5rem' }}>
      <h1 className='text-[4em] font-bold'>404</h1>
      <h1 className='text-[1.5em]'>OOPS! Page not found.</h1>
      <p>The page you are looking for does not exist.</p>

      <Link href={'/chat'} className='flex justify-center mt-5'><button className="btn btn-neon">Back to home</button></Link>

    </div>
  )
}

export default NotFound