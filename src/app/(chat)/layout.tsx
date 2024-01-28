import ChatForm from '@/components/chat-form'
import Navbar from '@/components/navbar'
import Sidebar from '@/components/sidebar'
import React from 'react'

function Layout({ children, params }: { children: React.ReactNode, params: { id: string } }) {

    return (
        <div className="w-full h-full">
            <div className="flex w-full h-full">
                <div className="md:block hidden sidebar w-[260px] border-[#464e5d] border-r h-full">
                    <Sidebar />
                </div>

                <div className="flex flex-col flex-1 h-full justify-center">
                <Navbar />
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Layout
