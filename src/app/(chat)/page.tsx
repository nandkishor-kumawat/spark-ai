import Chat from '@/components/chat';
import { generateUUID } from '@/lib/utils'
import React from 'react'

const page = () => {
  const id = generateUUID();

  return (
    <Chat
      key={id}
      id={id}
      initialMessages={[]}
    />
  )
}

export default page
