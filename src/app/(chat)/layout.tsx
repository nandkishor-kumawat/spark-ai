import ChatForm from '@/components/chat-form'
import Navbar from '@/components/navbar'
import Sidebar from '@/components/sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import React from 'react'

const MaxWidthWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="max-w-3xl mx-auto w-full px-2">
            {children}
        </div>
    )
}

function Layout({ children, params }: { children: React.ReactNode, params: { id: string } }) {
    return (
        <div className="w-full h-full">
            <div className="flex w-full h-full">
                <div className="md:block hidden sidebar min-w-[260px] max-w-[300px] border-r-zinc-800 border-r h-full">
                    <Sidebar />
                </div>

                <div className="flex flex-col flex-1 h-full flex-grow">
                    <Navbar />
                    <div className="w-full h-full">
                        <div className="flex-grow flex flex-col px-1" style={{
                            height: 'calc(100vh - 40px)'
                        }}>
                            <ScrollArea className='h-full'>
                                <div className="max-w-3xl mx-auto w-full px-2">
                                    <MaxWidthWrapper>
                                        {children}
                                    </MaxWidthWrapper>
                                </div>
                            </ScrollArea>

                            <MaxWidthWrapper>
                                <ChatForm />
                            </MaxWidthWrapper>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Layout
