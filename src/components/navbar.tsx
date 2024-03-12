import React from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { RiMenu4Line } from "react-icons/ri";
import Sidebar from './sidebar';

const Navbar = () => {
    return (
        <div className="border-b border-b-zinc-800 w-full p-2 flex items-center">
            <Sheet>
                <SheetTrigger className='p-2 block md:hidden'>
                    <RiMenu4Line className='w-5 h-5' />
                </SheetTrigger>
                <SheetContent side={'left'} className='w-[300px]'>
                    {/* <SheetHeader>
                        <SheetTitle>Are you absolutely sure?</SheetTitle>
                        <SheetDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove your data from our servers.
                        </SheetDescription>
                    </SheetHeader> */}
                    <Sidebar />
                </SheetContent>
            </Sheet>
            <div className="flex-1 text-center">Gemini Pro</div>
        </div>
    )
}

export default Navbar