import React, { useTransition } from 'react'
import { MdEdit } from 'react-icons/md'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function GroupRenameButton({ group }: any) {

  const params = useParams();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const renameGroup = async () => {
    startTransition(async () => {
      // const a = await deleteGroupChat(group_id);
      // console.log(a)

      toast.success("Chat deleted successfully", {
        style: {
          color: 'green',
        },
        position: 'top-center',
        duration: 3000
      });

    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className='group-hover:visible invisible px-1 py-1.5 bg-transparent hover:bg-transparent'>
          <MdEdit className='hover:text-white text-zinc-400 cursor-pointer' />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename group</DialogTitle>
        </DialogHeader>
        <div className="flex items-center flex-wrap gap-2">
          <div className="grid flex-1 gap-2 basis-64">
            <label htmlFor="name" className="sr-only">
              Group name
            </label>
            <Input
              id="name"
              defaultValue={group.name}
            />
          </div>
          <Button type="button" variant="secondary">
            Rename
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
