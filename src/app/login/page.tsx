"use client"
import { signIn, signOut, useSession } from 'next-auth/react'
import React from 'react'

const Page = () => {
  const {data} = useSession()
  return (
    <>
      {data?.user ? <button onClick={() => signOut()}>Sign Out</button> : <button onClick={() => signIn('google')}>Sign In</button>}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  )
}

export default Page