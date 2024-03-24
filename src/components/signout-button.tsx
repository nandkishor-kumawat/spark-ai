"use client"
import React from 'react'
import { MdLogout } from 'react-icons/md'
import { signOut } from 'next-auth/react'

function SignoutButton() {
    return (
        <button className='p-2 hover:bg-zinc-900 transition-all ease-linear duration-150 rounded-md' onClick={() => signOut()}>
            <MdLogout className='text-zinc-400' />
        </button>
    )
}

export default SignoutButton
